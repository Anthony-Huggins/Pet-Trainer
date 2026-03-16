package com.pawforward.api.booking.dto;

import com.pawforward.api.booking.Booking;
import com.pawforward.api.booking.BookingStatus;
import com.pawforward.api.scheduling.dto.SessionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class BookingResponse {

    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID dogId;
    private String dogName;
    private SessionResponse session;
    private BookingStatus status;
    private String cancellationReason;
    private Instant createdAt;
    private Instant updatedAt;

    public static BookingResponse from(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .clientId(booking.getClient().getId())
                .clientName(booking.getClient().getFullName())
                .dogId(booking.getDog().getId())
                .dogName(booking.getDog().getName())
                .session(SessionResponse.from(booking.getSession()))
                .status(booking.getStatus())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
