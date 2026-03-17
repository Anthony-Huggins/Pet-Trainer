package com.pawforward.api.scheduling;

import com.pawforward.api.scheduling.dto.AvailableSlotResponse;
import com.pawforward.api.scheduling.dto.ClassSeriesRequest;
import com.pawforward.api.scheduling.dto.ClassSeriesResponse;
import com.pawforward.api.scheduling.dto.SessionRequest;
import com.pawforward.api.scheduling.dto.SessionResponse;
import com.pawforward.api.service.ServiceType;
import com.pawforward.api.service.ServiceTypeRepository;
import com.pawforward.api.trainer.TrainerAvailability;
import com.pawforward.api.trainer.TrainerAvailabilityRepository;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class SchedulingService {

    private final SessionRepository sessionRepository;
    private final ClassSeriesRepository classSeriesRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final TrainerAvailabilityRepository availabilityRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public SchedulingService(SessionRepository sessionRepository,
                             ClassSeriesRepository classSeriesRepository,
                             TrainerProfileRepository trainerProfileRepository,
                             TrainerAvailabilityRepository availabilityRepository,
                             ServiceTypeRepository serviceTypeRepository) {
        this.sessionRepository = sessionRepository;
        this.classSeriesRepository = classSeriesRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    // --- Session CRUD (admin/trainer) ---

    @Transactional
    public SessionResponse createSession(SessionRequest request) {
        TrainerProfile trainer = findTrainer(request.getTrainerId());
        ServiceType serviceType = findServiceType(request.getServiceTypeId());

        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateNoConflict(trainer.getId(), request.getSessionDate(),
                request.getStartTime(), request.getEndTime());

        Session session = Session.builder()
                .serviceType(serviceType)
                .trainer(trainer)
                .sessionDate(request.getSessionDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .notes(request.getNotes())
                .status(SessionStatus.SCHEDULED)
                .build();

        session = sessionRepository.save(session);
        return SessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        return SessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessionsByTrainer(UUID trainerId, LocalDate from, LocalDate to) {
        findTrainer(trainerId); // verify exists
        return sessionRepository.findByTrainerIdAndSessionDateBetween(trainerId, from, to).stream()
                .map(SessionResponse::from)
                .toList();
    }

    @Transactional
    public SessionResponse cancelSession(UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new IllegalStateException("Session is already cancelled");
        }

        session.setStatus(SessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        return SessionResponse.from(session);
    }

    // --- Class Series CRUD (admin/trainer) ---

    @Transactional
    public ClassSeriesResponse createClassSeries(ClassSeriesRequest request) {
        TrainerProfile trainer = findTrainer(request.getTrainerId());
        ServiceType serviceType = findServiceType(request.getServiceTypeId());

        validateTimeRange(request.getStartTime(), request.getEndTime());

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        ClassSeries classSeries = ClassSeries.builder()
                .serviceType(serviceType)
                .trainer(trainer)
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .currentEnrollment(0)
                .status(ClassSeriesStatus.OPEN)
                .build();

        classSeries = classSeriesRepository.save(classSeries);

        // Auto-generate individual sessions for each occurrence
        generateClassSessions(classSeries);

        return ClassSeriesResponse.from(classSeries);
    }

    @Transactional(readOnly = true)
    public ClassSeriesResponse getClassSeries(UUID classSeriesId) {
        ClassSeries cs = classSeriesRepository.findById(classSeriesId)
                .orElseThrow(() -> new EntityNotFoundException("Class series not found"));
        return ClassSeriesResponse.from(cs);
    }

    @Transactional(readOnly = true)
    public List<ClassSeriesResponse> getUpcomingClasses() {
        List<ClassSeriesStatus> openStatuses = List.of(ClassSeriesStatus.OPEN, ClassSeriesStatus.FULL);
        return classSeriesRepository.findByStatusInOrderByStartDate(openStatuses).stream()
                .map(ClassSeriesResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getClassSeriesSessions(UUID classSeriesId) {
        classSeriesRepository.findById(classSeriesId)
                .orElseThrow(() -> new EntityNotFoundException("Class series not found"));
        return sessionRepository.findByClassSeriesId(classSeriesId).stream()
                .map(SessionResponse::from)
                .toList();
    }

    // --- Available Slots Algorithm ---

    /**
     * Computes available booking slots for a trainer on a given date range
     * for a specific service type (using its duration).
     *
     * Algorithm:
     * 1. For each date in range, determine trainer's availability windows
     *    (recurring availability for that day of week, merged with date-specific overrides)
     * 2. Subtract existing booked sessions from the windows
     * 3. Split remaining free windows into slots of the service's duration
     */
    @Transactional(readOnly = true)
    public List<AvailableSlotResponse> getAvailableSlots(UUID trainerId, UUID serviceTypeId,
                                                          LocalDate fromDate, LocalDate toDate) {
        TrainerProfile trainer = findTrainer(trainerId);
        ServiceType serviceType = findServiceType(serviceTypeId);

        int durationMinutes = serviceType.getDurationMinutes() != null
                ? serviceType.getDurationMinutes() : 60;

        List<AvailableSlotResponse> slots = new ArrayList<>();

        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            List<TimeWindow> windows = getAvailabilityWindows(trainerId, date);
            List<TimeWindow> booked = getBookedWindows(trainerId, date);
            List<TimeWindow> freeWindows = subtractBookedFromAvailable(windows, booked);

            for (TimeWindow free : freeWindows) {
                LocalTime slotStart = free.start;
                while (true) {
                    LocalTime slotEnd = slotStart.plusMinutes(durationMinutes);
                    if (slotEnd.isAfter(free.end)) break;

                    slots.add(AvailableSlotResponse.builder()
                            .trainerId(trainer.getId())
                            .trainerName(trainer.getUser().getFullName())
                            .date(date)
                            .startTime(slotStart)
                            .endTime(slotEnd)
                            .durationMinutes(durationMinutes)
                            .build());

                    slotStart = slotEnd;
                }
            }
        }

        return slots;
    }

    // --- Conflict Detection ---

    public void validateNoConflict(UUID trainerId, LocalDate date,
                                    LocalTime startTime, LocalTime endTime) {
        List<Session> conflicts = sessionRepository.findConflictingSessions(
                trainerId, date, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException(
                    "Time conflict: trainer already has a session from " +
                    conflicts.get(0).getStartTime() + " to " + conflicts.get(0).getEndTime());
        }
    }

    // --- Internal helpers ---

    /**
     * Get availability windows for a trainer on a specific date.
     * Date-specific overrides take precedence over recurring availability.
     */
    private List<TimeWindow> getAvailabilityWindows(UUID trainerId, LocalDate date) {
        // Check for date-specific overrides first
        List<TrainerAvailability> dateOverrides =
                availabilityRepository.findByTrainerIdAndSpecificDate(trainerId, date);

        if (!dateOverrides.isEmpty()) {
            // Use only date-specific entries for this day
            return dateOverrides.stream()
                    .filter(TrainerAvailability::isAvailable)
                    .map(a -> new TimeWindow(a.getStartTime(), a.getEndTime()))
                    .sorted(Comparator.comparing(w -> w.start))
                    .toList();
        }

        // Fall back to recurring availability for this day of week
        DayOfWeek dow = date.getDayOfWeek();
        short dayOfWeekValue = (short) (dow.getValue()); // Monday=1, Sunday=7
        List<TrainerAvailability> recurring =
                availabilityRepository.findByTrainerIdAndDayOfWeekAndRecurringTrue(trainerId, dayOfWeekValue);

        return recurring.stream()
                .filter(TrainerAvailability::isAvailable)
                .map(a -> new TimeWindow(a.getStartTime(), a.getEndTime()))
                .sorted(Comparator.comparing(w -> w.start))
                .toList();
    }

    /**
     * Get already-booked time windows for a trainer on a specific date.
     */
    private List<TimeWindow> getBookedWindows(UUID trainerId, LocalDate date) {
        return sessionRepository.findBySessionDateAndTrainerId(date, trainerId).stream()
                .filter(s -> s.getStatus() != SessionStatus.CANCELLED)
                .map(s -> new TimeWindow(s.getStartTime(), s.getEndTime()))
                .sorted(Comparator.comparing(w -> w.start))
                .toList();
    }

    /**
     * Subtracts booked time windows from available windows to get free slots.
     */
    private List<TimeWindow> subtractBookedFromAvailable(List<TimeWindow> available,
                                                          List<TimeWindow> booked) {
        List<TimeWindow> result = new ArrayList<>();

        for (TimeWindow avail : available) {
            List<TimeWindow> remaining = List.of(avail);

            for (TimeWindow busy : booked) {
                List<TimeWindow> next = new ArrayList<>();
                for (TimeWindow r : remaining) {
                    next.addAll(r.subtract(busy));
                }
                remaining = next;
            }

            result.addAll(remaining);
        }

        return result;
    }

    private void generateClassSessions(ClassSeries classSeries) {
        DayOfWeek targetDay = DayOfWeek.of(classSeries.getDayOfWeek());
        LocalDate date = classSeries.getStartDate();

        // Advance to the first occurrence of the target day
        while (date.getDayOfWeek() != targetDay) {
            date = date.plusDays(1);
        }

        while (!date.isAfter(classSeries.getEndDate())) {
            Session session = Session.builder()
                    .serviceType(classSeries.getServiceType())
                    .classSeries(classSeries)
                    .trainer(classSeries.getTrainer())
                    .sessionDate(date)
                    .startTime(classSeries.getStartTime())
                    .endTime(classSeries.getEndTime())
                    .location(classSeries.getLocation())
                    .status(SessionStatus.SCHEDULED)
                    .build();
            sessionRepository.save(session);
            date = date.plusWeeks(1);
        }
    }

    private void validateTimeRange(LocalTime start, LocalTime end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private TrainerProfile findTrainer(UUID trainerId) {
        return trainerProfileRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));
    }

    private ServiceType findServiceType(UUID serviceTypeId) {
        return serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Service type not found"));
    }

    // --- Internal time window record ---

    private record TimeWindow(LocalTime start, LocalTime end) {

        /**
         * Subtracts another window from this one, returning the remaining pieces.
         */
        List<TimeWindow> subtract(TimeWindow other) {
            // No overlap
            if (!other.start.isBefore(end) || !other.end.isAfter(start)) {
                return List.of(this);
            }

            List<TimeWindow> result = new ArrayList<>();

            // Left remainder
            if (other.start.isAfter(start)) {
                result.add(new TimeWindow(start, other.start));
            }

            // Right remainder
            if (other.end.isBefore(end)) {
                result.add(new TimeWindow(other.end, end));
            }

            return result;
        }
    }
}
