package com.pawforward.api.dog;

import com.pawforward.api.common.BaseEntity;
import com.pawforward.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String breed;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "weight_lbs", precision = 5, scale = 1)
    private BigDecimal weightLbs;

    @Column(length = 10)
    private String gender;

    @Column(name = "spayed_neutered")
    private Boolean spayedNeutered;

    @Column(name = "microchip_id", length = 50)
    private String microchipId;

    @Column(name = "veterinarian_name", length = 200)
    private String veterinarianName;

    @Column(name = "veterinarian_phone", length = 20)
    private String veterinarianPhone;

    @Column(name = "special_needs", columnDefinition = "TEXT")
    private String specialNeeds;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @OneToMany(mappedBy = "dog", fetch = FetchType.LAZY)
    @Builder.Default
    private List<DogVaccination> vaccinations = new ArrayList<>();
}
