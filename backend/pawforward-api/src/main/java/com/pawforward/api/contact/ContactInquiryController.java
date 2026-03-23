package com.pawforward.api.contact;

import com.pawforward.api.contact.dto.ContactInquiryRequest;
import com.pawforward.api.contact.dto.ContactInquiryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactInquiryController {

    private final ContactInquiryService contactInquiryService;

    public ContactInquiryController(ContactInquiryService contactInquiryService) {
        this.contactInquiryService = contactInquiryService;
    }

    @PostMapping
    public ResponseEntity<ContactInquiryResponse> submitInquiry(
            @Valid @RequestBody ContactInquiryRequest request) {
        ContactInquiryResponse response = contactInquiryService.submitInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
