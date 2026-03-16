package com.pawforward.api.trainer;

import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.trainer.dto.TrainerAvailabilityRequest;
import com.pawforward.api.trainer.dto.TrainerAvailabilityResponse;
import com.pawforward.api.trainer.dto.TrainerProfileRequest;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TrainerProfileService {

    private final TrainerProfileRepository trainerProfileRepository;
    private final TrainerAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public TrainerProfileService(TrainerProfileRepository trainerProfileRepository,
                                  TrainerAvailabilityRepository availabilityRepository,
                                  UserRepository userRepository) {
        this.trainerProfileRepository = trainerProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
    }

    // --- Public endpoints ---

    @Transactional(readOnly = true)
    public List<TrainerProfileResponse> getAllActiveTrainers() {
        return trainerProfileRepository.findByAcceptingClientsTrue().stream()
                .map(TrainerProfileResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrainerProfileResponse getTrainer(UUID trainerId) {
        TrainerProfile profile = findById(trainerId);
        return TrainerProfileResponse.from(profile);
    }

    @Transactional(readOnly = true)
    public List<TrainerAvailabilityResponse> getTrainerAvailability(UUID trainerId) {
        findById(trainerId); // verify trainer exists
        return availabilityRepository.findByTrainerIdAndAvailableTrue(trainerId).stream()
                .map(TrainerAvailabilityResponse::from)
                .toList();
    }

    // --- Trainer self-management ---

    @Transactional(readOnly = true)
    public TrainerProfileResponse getMyProfile() {
        User user = getCurrentUser();
        TrainerProfile profile = trainerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));
        return TrainerProfileResponse.from(profile);
    }

    @Transactional
    public TrainerProfileResponse updateMyProfile(TrainerProfileRequest request) {
        User user = getCurrentUser();
        TrainerProfile profile = trainerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getSpecializations() != null) {
            profile.setSpecializations(request.getSpecializations().toArray(new String[0]));
        }
        if (request.getCertifications() != null) {
            profile.setCertifications(request.getCertifications().toArray(new String[0]));
        }
        if (request.getYearsExperience() != null) {
            profile.setYearsExperience(request.getYearsExperience());
        }
        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }
        if (request.getAcceptingClients() != null) {
            profile.setAcceptingClients(request.getAcceptingClients());
        }

        profile = trainerProfileRepository.save(profile);
        return TrainerProfileResponse.from(profile);
    }

    // --- Availability management ---

    @Transactional(readOnly = true)
    public List<TrainerAvailabilityResponse> getMyAvailability() {
        User user = getCurrentUser();
        TrainerProfile profile = trainerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));
        return availabilityRepository.findByTrainerId(profile.getId()).stream()
                .map(TrainerAvailabilityResponse::from)
                .toList();
    }

    @Transactional
    public TrainerAvailabilityResponse addAvailability(TrainerAvailabilityRequest request) {
        User user = getCurrentUser();
        TrainerProfile profile = trainerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        TrainerAvailability availability = TrainerAvailability.builder()
                .trainer(profile)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .recurring(request.getRecurring() != null ? request.getRecurring() : true)
                .specificDate(request.getSpecificDate())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        availability = availabilityRepository.save(availability);
        return TrainerAvailabilityResponse.from(availability);
    }

    @Transactional
    public void deleteAvailability(UUID availabilityId) {
        User user = getCurrentUser();
        TrainerProfile profile = trainerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));

        TrainerAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new EntityNotFoundException("Availability slot not found"));

        if (!availability.getTrainer().getId().equals(profile.getId())) {
            throw new AccessDeniedException("You can only delete your own availability");
        }

        availabilityRepository.delete(availability);
    }

    // --- Admin: create trainer profile ---

    @Transactional
    public TrainerProfileResponse createTrainerProfile(UUID userId, TrainerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (trainerProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Trainer profile already exists for this user");
        }

        TrainerProfile profile = TrainerProfile.builder()
                .user(user)
                .bio(request.getBio())
                .specializations(request.getSpecializations() != null
                        ? request.getSpecializations().toArray(new String[0]) : null)
                .certifications(request.getCertifications() != null
                        ? request.getCertifications().toArray(new String[0]) : null)
                .yearsExperience(request.getYearsExperience())
                .hourlyRate(request.getHourlyRate())
                .acceptingClients(request.getAcceptingClients() != null ? request.getAcceptingClients() : true)
                .build();

        profile = trainerProfileRepository.save(profile);
        return TrainerProfileResponse.from(profile);
    }

    // --- Helpers ---

    private TrainerProfile findById(UUID trainerId) {
        return trainerProfileRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
