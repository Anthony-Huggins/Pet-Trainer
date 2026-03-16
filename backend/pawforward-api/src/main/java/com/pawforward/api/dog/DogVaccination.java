package com.pawforward.api.dog;

import com.pawforward.api.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "dog_vaccinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DogVaccination extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dog_id", nullable = false)
    private Dog dog;

    @Column(name = "vaccination_name", nullable = false, length = 100)
    private String vaccinationName;

    @Column(name = "administered_date", nullable = false)
    private LocalDate administeredDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "document_url", length = 500)
    private String documentUrl;
}
