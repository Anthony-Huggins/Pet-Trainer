package com.pawforward.api.training.dto;

import com.pawforward.api.training.TrainingMedia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class TrainingMediaResponse {

    private UUID id;
    private String mediaType;
    private String url;
    private String thumbnailUrl;
    private String caption;
    private Instant createdAt;

    public static TrainingMediaResponse from(TrainingMedia media) {
        return TrainingMediaResponse.builder()
                .id(media.getId())
                .mediaType(media.getMediaType())
                .url(media.getUrl())
                .thumbnailUrl(media.getThumbnailUrl())
                .caption(media.getCaption())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
