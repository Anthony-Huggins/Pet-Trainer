package com.pawforward.api.boardtrain.dto;

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
public class DailyNoteResponse {

    private LocalDate date;
    private String note;
    private List<String> mediaUrls;
    private String mood;
}
