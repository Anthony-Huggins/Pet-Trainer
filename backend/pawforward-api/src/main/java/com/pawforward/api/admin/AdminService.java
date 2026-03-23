package com.pawforward.api.admin;

import com.pawforward.api.admin.dto.CreateTrainerRequest;
import com.pawforward.api.admin.dto.DashboardStatsResponse;
import com.pawforward.api.admin.dto.RevenueReportResponse;
import com.pawforward.api.booking.Booking;
import com.pawforward.api.booking.BookingRepository;
import com.pawforward.api.booking.BookingStatus;
import com.pawforward.api.booking.dto.BookingResponse;
import com.pawforward.api.contact.ContactInquiryService;
import com.pawforward.api.contact.dto.ContactInquiryResponse;
import com.pawforward.api.payment.Payment;
import com.pawforward.api.payment.PaymentRepository;
import com.pawforward.api.review.Review;
import com.pawforward.api.review.ReviewRepository;
import com.pawforward.api.review.dto.ReviewResponse;
import com.pawforward.api.scheduling.ClassSeriesRepository;
import com.pawforward.api.scheduling.dto.ClassSeriesResponse;
import com.pawforward.api.trainer.TrainerProfile;
import com.pawforward.api.trainer.TrainerProfileRepository;
import com.pawforward.api.trainer.dto.TrainerProfileResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import com.pawforward.api.user.UserRole;
import com.pawforward.api.user.dto.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final ClassSeriesRepository classSeriesRepository;
    private final ContactInquiryService contactInquiryService;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        TrainerProfileRepository trainerProfileRepository,
                        BookingRepository bookingRepository,
                        PaymentRepository paymentRepository,
                        ReviewRepository reviewRepository,
                        ClassSeriesRepository classSeriesRepository,
                        ContactInquiryService contactInquiryService,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.trainerProfileRepository = trainerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.classSeriesRepository = classSeriesRepository;
        this.contactInquiryService = contactInquiryService;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Dashboard ---

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        Instant startOfMonth = YearMonth.now().atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        BigDecimal totalRevenue = paymentRepository.sumAmountByStatus("SUCCEEDED");
        long activeTrainers = trainerProfileRepository.findByAcceptingClientsTrue().size();
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long bookingsThisMonth = bookingRepository.countByCreatedAtAfter(startOfMonth);
        BigDecimal revenueThisMonth = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCEEDED", startOfMonth);

        List<BookingResponse> recentActivity = bookingRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(BookingResponse::from)
                .toList();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .activeTrainers(activeTrainers)
                .newUsersThisMonth(newUsersThisMonth)
                .bookingsThisMonth(bookingsThisMonth)
                .revenueThisMonth(revenueThisMonth)
                .recentActivity(recentActivity)
                .build();
    }

    // --- Users ---

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(UUID userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setRole(role);
        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUserStatus(UUID userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setEnabled(enabled);
        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    // --- Trainers ---

    @Transactional(readOnly = true)
    public List<TrainerProfileResponse> getAllTrainers() {
        return trainerProfileRepository.findAll().stream()
                .map(TrainerProfileResponse::from)
                .toList();
    }

    @Transactional
    public TrainerProfileResponse createTrainer(CreateTrainerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(UserRole.TRAINER)
                .emailVerified(true)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        TrainerProfile profile = TrainerProfile.builder()
                .user(user)
                .bio(request.getBio())
                .specializations(request.getSpecializations() != null
                        ? request.getSpecializations().toArray(new String[0]) : null)
                .certifications(request.getCertifications() != null
                        ? request.getCertifications().toArray(new String[0]) : null)
                .yearsExperience(request.getYearsExperience())
                .hourlyRate(request.getHourlyRate())
                .acceptingClients(request.getAcceptingClients() != null ? request.getAcceptingClients() : true)
                .build();

        profile = trainerProfileRepository.save(profile);
        return TrainerProfileResponse.from(profile);
    }

    // --- Bookings ---

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable) {
        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            page = bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(BookingResponse::from);
    }

    @Transactional
    public BookingResponse updateBookingStatus(UUID bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        booking.setStatus(status);
        booking = bookingRepository.save(booking);
        return BookingResponse.from(booking);
    }

    // --- Classes ---

    @Transactional(readOnly = true)
    public List<ClassSeriesResponse> getAllClassSeries() {
        return classSeriesRepository.findAll().stream()
                .map(ClassSeriesResponse::from)
                .toList();
    }

    // --- Reviews ---

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse approveReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        review.setApproved(true);
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse rejectReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        review.setApproved(false);
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse toggleFeaturedReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        review.setFeatured(!review.isFeatured());
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    // --- Inquiries ---

    @Transactional(readOnly = true)
    public List<ContactInquiryResponse> getAllInquiries() {
        return contactInquiryService.getAllInquiries();
    }

    @Transactional
    public ContactInquiryResponse respondToInquiry(UUID inquiryId, String responseText) {
        return contactInquiryService.respondToInquiry(inquiryId, responseText);
    }

    @Transactional
    public ContactInquiryResponse archiveInquiry(UUID inquiryId) {
        return contactInquiryService.archiveInquiry(inquiryId);
    }

    // --- Revenue ---

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport() {
        BigDecimal totalRevenue = paymentRepository.sumAmountByStatus("SUCCEEDED");

        Instant startOfMonth = YearMonth.now().atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        BigDecimal monthlyRevenue = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCEEDED", startOfMonth);

        // Revenue by service
        List<Payment> succeededPayments = paymentRepository.findByStatus("SUCCEEDED");
        Map<String, BigDecimal> revenueByServiceMap = succeededPayments.stream()
                .filter(p -> p.getBooking() != null && p.getBooking().getSession() != null
                        && p.getBooking().getSession().getServiceType() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getBooking().getSession().getServiceType().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)
                ));

        List<RevenueReportResponse.ServiceRevenue> revenueByService = revenueByServiceMap.entrySet().stream()
                .map(entry -> RevenueReportResponse.ServiceRevenue.builder()
                        .serviceName(entry.getKey())
                        .total(entry.getValue())
                        .build())
                .toList();

        // Monthly trend - last 12 months
        List<RevenueReportResponse.MonthlyRevenue> monthlyTrend = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            Instant from = month.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant to = month.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

            BigDecimal revenue = paymentRepository.sumAmountByStatusAndCreatedAtBetween("SUCCEEDED", from, to);
            monthlyTrend.add(RevenueReportResponse.MonthlyRevenue.builder()
                    .year(month.getYear())
                    .month(month.getMonthValue())
                    .revenue(revenue)
                    .build());
        }

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .revenueByService(revenueByService)
                .monthlyTrend(monthlyTrend)
                .build();
    }
}
