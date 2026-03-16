package com.pawforward.api.dog;

import com.pawforward.api.dog.dto.DogRequest;
import com.pawforward.api.dog.dto.DogResponse;
import com.pawforward.api.dog.dto.DogVaccinationRequest;
import com.pawforward.api.dog.dto.DogVaccinationResponse;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DogService {

    private final DogRepository dogRepository;
    private final DogVaccinationRepository vaccinationRepository;
    private final UserRepository userRepository;

    public DogService(DogRepository dogRepository,
                      DogVaccinationRepository vaccinationRepository,
                      UserRepository userRepository) {
        this.dogRepository = dogRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DogResponse> getMyDogs() {
        User owner = getCurrentUser();
        return dogRepository.findByOwnerId(owner.getId()).stream()
                .map(DogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DogResponse getDog(UUID dogId) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);
        return DogResponse.from(dog);
    }

    @Transactional
    public DogResponse createDog(DogRequest request) {
        User owner = getCurrentUser();

        Dog dog = Dog.builder()
                .owner(owner)
                .name(request.getName().trim())
                .breed(request.getBreed())
                .dateOfBirth(request.getDateOfBirth())
                .weightLbs(request.getWeightLbs())
                .gender(request.getGender())
                .spayedNeutered(request.getSpayedNeutered())
                .microchipId(request.getMicrochipId())
                .veterinarianName(request.getVeterinarianName())
                .veterinarianPhone(request.getVeterinarianPhone())
                .specialNeeds(request.getSpecialNeeds())
                .build();

        dog = dogRepository.save(dog);
        return DogResponse.from(dog);
    }

    @Transactional
    public DogResponse updateDog(UUID dogId, DogRequest request) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);

        dog.setName(request.getName().trim());
        dog.setBreed(request.getBreed());
        dog.setDateOfBirth(request.getDateOfBirth());
        dog.setWeightLbs(request.getWeightLbs());
        dog.setGender(request.getGender());
        dog.setSpayedNeutered(request.getSpayedNeutered());
        dog.setMicrochipId(request.getMicrochipId());
        dog.setVeterinarianName(request.getVeterinarianName());
        dog.setVeterinarianPhone(request.getVeterinarianPhone());
        dog.setSpecialNeeds(request.getSpecialNeeds());

        dog = dogRepository.save(dog);
        return DogResponse.from(dog);
    }

    @Transactional
    public void deleteDog(UUID dogId) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);
        dogRepository.delete(dog);
    }

    // --- Vaccination methods ---

    @Transactional(readOnly = true)
    public List<DogVaccinationResponse> getVaccinations(UUID dogId) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);
        return vaccinationRepository.findByDogId(dogId).stream()
                .map(DogVaccinationResponse::from)
                .toList();
    }

    @Transactional
    public DogVaccinationResponse addVaccination(UUID dogId, DogVaccinationRequest request) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);

        DogVaccination vaccination = DogVaccination.builder()
                .dog(dog)
                .vaccinationName(request.getVaccinationName().trim())
                .administeredDate(request.getAdministeredDate())
                .expirationDate(request.getExpirationDate())
                .documentUrl(request.getDocumentUrl())
                .build();

        vaccination = vaccinationRepository.save(vaccination);
        return DogVaccinationResponse.from(vaccination);
    }

    @Transactional
    public void deleteVaccination(UUID dogId, UUID vaccinationId) {
        Dog dog = findDogById(dogId);
        verifyOwnership(dog);

        DogVaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new EntityNotFoundException("Vaccination not found"));

        if (!vaccination.getDog().getId().equals(dogId)) {
            throw new IllegalArgumentException("Vaccination does not belong to this dog");
        }

        vaccinationRepository.delete(vaccination);
    }

    // --- Helpers ---

    private Dog findDogById(UUID dogId) {
        return dogRepository.findById(dogId)
                .orElseThrow(() -> new EntityNotFoundException("Dog not found"));
    }

    private void verifyOwnership(Dog dog) {
        User currentUser = getCurrentUser();
        if (!dog.getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("You don't have permission to access this dog's information");
        }
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
