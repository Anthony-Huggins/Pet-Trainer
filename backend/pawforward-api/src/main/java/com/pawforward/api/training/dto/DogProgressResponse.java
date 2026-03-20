package com.pawforward.api.training.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class DogProgressResponse {

    private List<TrainingGoalResponse> goals;
    private List<TrainingLogResponse> recentLogs;
    private long totalSessionsLogged;
}
