package com.pawforward.api.admin;

import com.pawforward.api.admin.dto.CreateTrainerRequest;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import com.pawforward.api.user.UserRole;
import com.pawforward.api.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        TrainerProfileRepository trainerProfileRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrainerProfileResponse> getAllTrainers() {
        return trainerProfileRepository.findAll().stream()
                .map(TrainerProfileResponse::from)
                .toList();
    }

    /**
     * Creates a new user with TRAINER role and an associated trainer profile in one step.
     */
    @Transactional
    public TrainerProfileResponse createTrainer(CreateTrainerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email is already registered");
        }

        // Create user with TRAINER role
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(UserRole.TRAINER)
                .emailVerified(true)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Create trainer profile
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
}
