package com.pawforward.api.booking;

import com.pawforward.api.booking.dto.BookingRequest;
import com.pawforward.api.booking.dto.BookingResponse;
import com.pawforward.api.booking.dto.ClassEnrollmentRequest;
import com.pawforward.api.booking.dto.ClassEnrollmentResponse;
import com.pawforward.api.dog.Dog;
import com.pawforward.api.dog.DogRepository;
import com.pawforward.api.scheduling.ClassSeries;
import com.pawforward.api.scheduling.ClassSeriesRepository;
import com.pawforward.api.scheduling.ClassSeriesStatus;
import com.pawforward.api.scheduling.Session;
import com.pawforward.api.scheduling.SessionRepository;
import com.pawforward.api.scheduling.SessionStatus;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final SessionRepository sessionRepository;
    private final ClassSeriesRepository classSeriesRepository;
    private final DogRepository dogRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ClassEnrollmentRepository enrollmentRepository,
                          SessionRepository sessionRepository,
                          ClassSeriesRepository classSeriesRepository,
                          DogRepository dogRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.classSeriesRepository = classSeriesRepository;
        this.dogRepository = dogRepository;
        this.userRepository = userRepository;
    }

    // --- Private session bookings ---

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByClientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(UUID bookingId) {
        Booking booking = findBookingById(bookingId);
        verifyBookingOwnership(booking);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User client = getCurrentUser();

        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new IllegalStateException("Session is not available for booking");
        }

        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));

        if (!dog.getOwner().getId().equals(client.getId())) {
            throw new AccessDeniedException("You can only book sessions for your own dogs");
        }

        // Check for duplicate booking by this client
        if (bookingRepository.existsBySessionIdAndClientIdAndStatusNot(
                session.getId(), client.getId(), BookingStatus.CANCELLED)) {
            throw new IllegalStateException("You already have a booking for this session");
        }

        // For private sessions (no class series), only one active booking allowed per session
        if (session.getClassSeries() == null) {
            List<Booking> existingBookings = bookingRepository.findBySessionId(session.getId())
                    .stream()
                    .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                    .toList();
            if (!existingBookings.isEmpty()) {
                throw new IllegalStateException("This session is already booked by another client");
            }
        }

        Booking booking = Booking.builder()
                .session(session)
                .client(client)
                .dog(dog)
                .status(BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String reason) {
        Booking booking = findBookingById(bookingId);
        verifyBookingOwnership(booking);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);
        return BookingResponse.from(booking);
    }

    // --- Class enrollments ---

    @Transactional(readOnly = true)
    public List<ClassEnrollmentResponse> getMyEnrollments() {
        User user = getCurrentUser();
        return enrollmentRepository.findByClientId(user.getId()).stream()
                .map(ClassEnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public ClassEnrollmentResponse enrollInClass(ClassEnrollmentRequest request) {
        User client = getCurrentUser();

        ClassSeries classSeries = classSeriesRepository.findById(request.getClassSeriesId())
                .orElseThrow(() -> new EntityNotFoundException("Class series not found"));

        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));

        if (!dog.getOwner().getId().equals(client.getId())) {
            throw new AccessDeniedException("You can only enroll your own dogs");
        }

        // Check for duplicate enrollment
        if (enrollmentRepository.existsByClassSeriesIdAndClientIdAndStatusNot(
                classSeries.getId(), client.getId(), EnrollmentStatus.DROPPED)) {
            throw new IllegalStateException("You are already enrolled in this class");
        }

        EnrollmentStatus status;
        Integer waitlistPosition = null;

        if (classSeries.getStatus() == ClassSeriesStatus.FULL) {
            // Waitlist
            status = EnrollmentStatus.WAITLISTED;
            List<ClassEnrollment> waitlisted = enrollmentRepository.findByClassSeriesId(classSeries.getId())
                    .stream()
                    .filter(e -> e.getStatus() == EnrollmentStatus.WAITLISTED)
                    .toList();
            waitlistPosition = waitlisted.size() + 1;
        } else if (classSeries.getStatus() == ClassSeriesStatus.OPEN) {
            status = EnrollmentStatus.ENROLLED;
            classSeries.setCurrentEnrollment(classSeries.getCurrentEnrollment() + 1);
            if (classSeries.getCurrentEnrollment() >= classSeries.getMaxParticipants()) {
                classSeries.setStatus(ClassSeriesStatus.FULL);
            }
            classSeriesRepository.save(classSeries);
        } else {
            throw new IllegalStateException("This class is not open for enrollment");
        }

        ClassEnrollment enrollment = ClassEnrollment.builder()
                .classSeries(classSeries)
                .client(client)
                .dog(dog)
                .status(status)
                .waitlistPosition(waitlistPosition)
                .enrolledAt(Instant.now())
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return ClassEnrollmentResponse.from(enrollment);
    }

    @Transactional
    public ClassEnrollmentResponse dropEnrollment(UUID enrollmentId) {
        User client = getCurrentUser();

        ClassEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found"));

        if (!enrollment.getClient().getId().equals(client.getId())) {
            throw new AccessDeniedException("You can only drop your own enrollments");
        }

        if (enrollment.getStatus() == EnrollmentStatus.DROPPED) {
            throw new IllegalStateException("Already dropped from this class");
        }

        boolean wasEnrolled = enrollment.getStatus() == EnrollmentStatus.ENROLLED;
        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollment = enrollmentRepository.save(enrollment);

        // If they were enrolled (not waitlisted), decrement count and potentially promote from waitlist
        if (wasEnrolled) {
            ClassSeries classSeries = enrollment.getClassSeries();
            classSeries.setCurrentEnrollment(Math.max(0, classSeries.getCurrentEnrollment() - 1));
            if (classSeries.getStatus() == ClassSeriesStatus.FULL) {
                classSeries.setStatus(ClassSeriesStatus.OPEN);
            }
            classSeriesRepository.save(classSeries);
        }

        return ClassEnrollmentResponse.from(enrollment);
    }

    // --- Helpers ---

    private Booking findBookingById(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
    }

    private void verifyBookingOwnership(Booking booking) {
        User currentUser = getCurrentUser();
        if (!booking.getClient().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("You don't have permission to access this booking");
        }
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
