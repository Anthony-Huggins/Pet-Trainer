package com.pawforward.api.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class RevenueReportResponse {

    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private List<ServiceRevenue> revenueByService;
    private List<MonthlyRevenue> monthlyTrend;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class ServiceRevenue {
        private String serviceName;
        private BigDecimal total;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class MonthlyRevenue {
        private int year;
        private int month;
        private BigDecimal revenue;
    }
}
