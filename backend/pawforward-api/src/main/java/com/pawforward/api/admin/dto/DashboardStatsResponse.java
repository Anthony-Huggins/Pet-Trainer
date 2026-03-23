package com.pawforward.api.admin.dto;

import com.pawforward.api.booking.dto.BookingResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private long activeTrainers;
    private long newUsersThisMonth;
    private long bookingsThisMonth;
    private BigDecimal revenueThisMonth;
    private List<BookingResponse> recentActivity;
}
