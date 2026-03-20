package com.pawforward.api.training;

import com.pawforward.api.dog.Dog;
import com.pawforward.api.dog.DogRepository;
import com.pawforward.api.scheduling.Session;
import com.pawforward.api.scheduling.SessionRepository;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.training.dto.DogProgressResponse;
import com.pawforward.api.training.dto.TrainingGoalRequest;
import com.pawforward.api.training.dto.TrainingGoalResponse;
import com.pawforward.api.training.dto.TrainingLogRequest;
import com.pawforward.api.training.dto.TrainingLogResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TrainingService {

    private final TrainingGoalRepository goalRepository;
    private final TrainingLogRepository logRepository;
    private final TrainingMediaRepository mediaRepository;
    private final DogRepository dogRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public TrainingService(TrainingGoalRepository goalRepository,
                           TrainingLogRepository logRepository,
                           TrainingMediaRepository mediaRepository,
                           DogRepository dogRepository,
                           TrainerProfileRepository trainerProfileRepository,
                           SessionRepository sessionRepository,
                           UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.logRepository = logRepository;
        this.mediaRepository = mediaRepository;
        this.dogRepository = dogRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    // --- Goals ---

    @Transactional
    public TrainingGoalResponse createGoal(TrainingGoalRequest req, UUID trainerId) {
        Dog dog = dogRepository.findById(req.getDogId())
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));

        TrainerProfile trainer = null;
        if (trainerId != null) {
            trainer = trainerProfileRepository.findByUserId(trainerId)
                    .orElse(null);
        }

        TrainingGoal goal = TrainingGoal.builder()
                .dog(dog)
                .trainer(trainer)
                .title(req.getTitle())
                .description(req.getDescription())
                .targetDate(req.getTargetDate())
                .status(req.getStatus() != null ? req.getStatus() : GoalStatus.IN_PROGRESS)
                .progressPercent(req.getProgressPercent() != null ? req.getProgressPercent() : 0)
                .build();

        goal = goalRepository.save(goal);
        return TrainingGoalResponse.from(goal);
    }

    @Transactional(readOnly = true)
    public List<TrainingGoalResponse> getGoalsForDog(UUID dogId) {
        return goalRepository.findByDogIdOrderByCreatedAtDesc(dogId).stream()
                .map(TrainingGoalResponse::from)
                .toList();
    }

    @Transactional
    public TrainingGoalResponse updateGoal(UUID goalId, TrainingGoalRequest req) {
        TrainingGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new EntityNotFoundException("Training goal not found"));

        if (req.getTitle() != null) {
            goal.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            goal.setDescription(req.getDescription());
        }
        if (req.getTargetDate() != null) {
            goal.setTargetDate(req.getTargetDate());
        }
        if (req.getStatus() != null) {
            goal.setStatus(req.getStatus());
        }
        if (req.getProgressPercent() != null) {
            goal.setProgressPercent(req.getProgressPercent());
        }

        goal = goalRepository.save(goal);
        return TrainingGoalResponse.from(goal);
    }

    @Transactional
    public void deleteGoal(UUID goalId) {
        if (!goalRepository.existsById(goalId)) {
            throw new EntityNotFoundException("Training goal not found");
        }
        goalRepository.deleteById(goalId);
    }

    // --- Logs ---

    @Transactional
    public TrainingLogResponse createLog(TrainingLogRequest req, UUID trainerId) {
        Dog dog = dogRepository.findById(req.getDogId())
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));

        TrainerProfile trainer = trainerProfileRepository.findByUserId(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));

        Session session = null;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new EntityNotFoundException("Session not found"));
        }

        TrainingLog log = TrainingLog.builder()
                .dog(dog)
                .trainer(trainer)
                .session(session)
                .logDate(req.getLogDate() != null ? req.getLogDate() : LocalDate.now())
                .summary(req.getSummary())
                .skillsWorked(req.getSkillsWorked() != null
                        ? req.getSkillsWorked().toArray(new String[0])
                        : null)
                .behaviorNotes(req.getBehaviorNotes())
                .homework(req.getHomework())
                .rating(req.getRating())
                .build();

        log = logRepository.save(log);
        return TrainingLogResponse.from(log);
    }

    @Transactional(readOnly = true)
    public List<TrainingLogResponse> getLogsForDog(UUID dogId) {
        return logRepository.findByDogIdOrderByLogDateDesc(dogId).stream()
                .map(TrainingLogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrainingLogResponse> getLogsForTrainer(UUID trainerId) {
        TrainerProfile trainer = trainerProfileRepository.findByUserId(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer profile not found"));

        return logRepository.findByTrainerIdOrderByLogDateDesc(trainer.getId()).stream()
                .map(TrainingLogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrainingLogResponse getLogById(UUID logId) {
        TrainingLog log = logRepository.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("Training log not found"));
        return TrainingLogResponse.from(log);
    }

    @Transactional(readOnly = true)
    public List<TrainingLogResponse> getLogsForDogBetweenDates(UUID dogId, LocalDate from, LocalDate to) {
        return logRepository.findByDogIdAndLogDateBetween(dogId, from, to).stream()
                .map(TrainingLogResponse::from)
                .toList();
    }

    // --- Progress ---

    @Transactional(readOnly = true)
    public DogProgressResponse getDogProgress(UUID dogId) {
        List<TrainingGoalResponse> goals = getGoalsForDog(dogId);
        List<TrainingLogResponse> recentLogs = logRepository.findByDogIdOrderByLogDateDesc(dogId).stream()
                .limit(10)
                .map(TrainingLogResponse::from)
                .toList();
        long totalSessionsLogged = logRepository.findByDogIdOrderByLogDateDesc(dogId).size();

        return DogProgressResponse.builder()
                .goals(goals)
                .recentLogs(recentLogs)
                .totalSessionsLogged(totalSessionsLogged)
                .build();
    }
}
