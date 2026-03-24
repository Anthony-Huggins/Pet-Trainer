package com.pawforward.api.boardtrain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pawforward.api.boardtrain.dto.BoardTrainRequest;
import com.pawforward.api.boardtrain.dto.BoardTrainResponse;
import com.pawforward.api.boardtrain.dto.DailyNoteRequest;
import com.pawforward.api.boardtrain.dto.DailyNoteResponse;
import com.pawforward.api.dog.Dog;
import com.pawforward.api.dog.DogRepository;
import com.pawforward.api.notification.NotificationDispatcher;
import com.pawforward.api.notification.NotificationType;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.service.ServiceType;
import com.pawforward.api.service.ServiceTypeRepository;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BoardTrainService {

    private final BoardTrainRepository boardTrainRepository;
    private final DogRepository dogRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final NotificationDispatcher notificationDispatcher;

    public BoardTrainService(BoardTrainRepository boardTrainRepository,
                             DogRepository dogRepository,
                             ServiceTypeRepository serviceTypeRepository,
                             TrainerProfileRepository trainerProfileRepository,
                             UserRepository userRepository,
                             ObjectMapper objectMapper,
                             NotificationDispatcher notificationDispatcher) {
        this.boardTrainRepository = boardTrainRepository;
        this.dogRepository = dogRepository;
        this.serviceTypeRepository = serviceTypeRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.notificationDispatcher = notificationDispatcher;
    }

    @Transactional
    public BoardTrainResponse createRequest(BoardTrainRequest request, UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));

        if (!dog.getOwner().getId().equals(clientId)) {
            throw new AccessDeniedException("You can only create programs for your own dogs");
        }

        ServiceType serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Service type not found"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        BoardTrainProgram program = BoardTrainProgram.builder()
                .serviceType(serviceType)
                .client(client)
                .dog(dog)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(BoardTrainStatus.PENDING)
                .dailyNotes("[]")
                .pickupInstructions(request.getPickupInstructions())
                .dropoffInstructions(request.getDropoffInstructions())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .build();

        program = boardTrainRepository.save(program);
        return BoardTrainResponse.from(program);
    }

    @Transactional(readOnly = true)
    public BoardTrainResponse getById(UUID id) {
        BoardTrainProgram program = findProgramById(id);
        return BoardTrainResponse.from(program);
    }

    @Transactional(readOnly = true)
    public List<BoardTrainResponse> getMyPrograms(UUID clientId) {
        return boardTrainRepository.findByClientIdOrderByCreatedAtDesc(clientId).stream()
                .map(BoardTrainResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BoardTrainResponse> getTrainerPrograms(UUID trainerId) {
        return boardTrainRepository.findByTrainerIdOrderByStartDateDesc(trainerId).stream()
                .map(BoardTrainResponse::from)
                .toList();
    }

    @Transactional
    public BoardTrainResponse assignTrainer(UUID programId, UUID trainerId) {
        BoardTrainProgram program = findProgramById(programId);

        TrainerProfile trainer = trainerProfileRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));

        program.setTrainer(trainer);
        program.setStatus(BoardTrainStatus.APPROVED);
        program = boardTrainRepository.save(program);
        return BoardTrainResponse.from(program);
    }

    @Transactional
    public BoardTrainResponse updateStatus(UUID programId, String status) {
        BoardTrainProgram program = findProgramById(programId);

        BoardTrainStatus newStatus;
        try {
            newStatus = BoardTrainStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        program.setStatus(newStatus);
        program = boardTrainRepository.save(program);
        return BoardTrainResponse.from(program);
    }

    @Transactional
    public DailyNoteResponse addDailyNote(UUID programId, DailyNoteRequest noteRequest, UUID trainerId) {
        BoardTrainProgram program = findProgramById(programId);

        if (program.getTrainer() == null || !program.getTrainer().getId().equals(trainerId)) {
            throw new AccessDeniedException("Only the assigned trainer can add daily notes");
        }

        List<Map<String, Object>> notes = parseDailyNotes(program.getDailyNotes());

        Map<String, Object> newNote = new HashMap<>();
        newNote.put("date", noteRequest.getDate().toString());
        newNote.put("note", noteRequest.getNote());
        newNote.put("mediaUrls", noteRequest.getMediaUrls() != null ? noteRequest.getMediaUrls() : new ArrayList<>());
        newNote.put("mood", noteRequest.getMood());

        notes.add(newNote);

        try {
            program.setDailyNotes(objectMapper.writeValueAsString(notes));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize daily notes", e);
        }

        boardTrainRepository.save(program);

        // Dispatch training update notification to the client
        User client = program.getClient();
        Dog dog = program.getDog();
        Map<String, Object> notifData = new HashMap<>();
        notifData.put("clientName", client.getFullName());
        notifData.put("dogName", dog.getName());
        notifData.put("note", noteRequest.getNote());
        notifData.put("updateType", "BOARD_TRAIN");
        notifData.put("programId", programId.toString());
        notificationDispatcher.dispatchNotification(
                client.getId(),
                NotificationType.TRAINING_UPDATE,
                "Daily Update for " + dog.getName(),
                noteRequest.getNote(),
                notifData,
                client.getEmail()
        );

        return DailyNoteResponse.builder()
                .date(noteRequest.getDate())
                .note(noteRequest.getNote())
                .mediaUrls(noteRequest.getMediaUrls() != null ? noteRequest.getMediaUrls() : new ArrayList<>())
                .mood(noteRequest.getMood())
                .build();
    }

    @Transactional(readOnly = true)
    public List<DailyNoteResponse> getDailyNotes(UUID programId) {
        BoardTrainProgram program = findProgramById(programId);
        List<Map<String, Object>> notes = parseDailyNotes(program.getDailyNotes());

        return notes.stream().map(note -> DailyNoteResponse.builder()
                .date(note.get("date") != null ? java.time.LocalDate.parse(note.get("date").toString()) : null)
                .note(note.get("note") != null ? note.get("note").toString() : null)
                .mediaUrls(note.get("mediaUrls") != null ? ((List<?>) note.get("mediaUrls")).stream()
                        .map(Object::toString).toList() : new ArrayList<>())
                .mood(note.get("mood") != null ? note.get("mood").toString() : null)
                .build()
        ).toList();
    }

    // --- Helpers ---

    private BoardTrainProgram findProgramById(UUID id) {
        return boardTrainRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Board & train program not found"));
    }

    public User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseDailyNotes(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }
}
