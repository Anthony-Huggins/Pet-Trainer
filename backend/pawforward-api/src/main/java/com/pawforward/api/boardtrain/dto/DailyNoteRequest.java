package com.pawforward.api.boardtrain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyNoteRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Note is required")
    private String note;

    private List<String> mediaUrls;

    private String mood;
}
