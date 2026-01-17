# Requirements Document

## Introduction

hAIr hero is a mobile application that helps users discover hairstyles that complement their unique facial features and hair characteristics. Users upload selfies for AI-powered analysis of their face shape and hair properties, receive personalized hairstyle recommendations based on styling rules, and can preview how different hairstyles would look on them through identity-preserving image generation. The app also enables users to save favorite looks and book appointments with nearby barbers or salons.

## Glossary

- **Face_Analyzer**: The AI component that processes selfie images to detect and classify face shapes
- **Hair_Analyzer**: The AI component that analyzes hair characteristics including texture, thickness, and current style
- **Recommendation_Engine**: The component that applies styling rules to suggest hairstyles based on face shape and hair characteristics
- **Preview_Generator**: The AI component that generates realistic hairstyle preview images while preserving user identity
- **Favorites_Manager**: The component that handles saving, retrieving, and managing user's favorite hairstyle looks
- **Marketplace**: The platform connecting users seeking hairstyle services with professional stylists
- **Discovery_Service**: The component that enables users to search and browse stylists in the marketplace
- **Booking_Handler**: The component that manages appointment scheduling between users and stylists
- **Scheduling_Manager**: The component that manages stylist availability and time slots
- **Messaging_Service**: The component that enables in-app communication between users and stylists
- **Stylist**: A professional barber or salon owner registered on the marketplace to offer hairstyle services
- **Face_Shape**: Classification of facial structure (oval, round, square, heart, oblong, diamond)
- **Hair_Texture**: Classification of hair type (straight, wavy, curly, coily)
- **Hair_Thickness**: Classification of hair density (fine, medium, thick)
- **Selfie**: A user-uploaded photograph of their face used for analysis
- **Hairstyle_Preview**: A generated image showing the user with a recommended hairstyle applied
- **Portfolio**: A collection of images showcasing a stylist's previous work
- **Booking_Request**: A pending appointment request from a user to a stylist

## Requirements

### Requirement 1: Selfie Upload and Validation

**User Story:** As a user, I want to upload selfies of my face, so that the app can analyze my features and recommend suitable hairstyles.

#### Acceptance Criteria

1. WHEN a user selects images from their device gallery THEN the Selfie_Upload_Handler SHALL accept JPEG, PNG, and HEIC image formats
2. WHEN a user captures a photo using the in-app camera THEN the Selfie_Upload_Handler SHALL store the captured image for analysis
3. WHEN an uploaded image does not contain a detectable human face THEN the Face_Validator SHALL reject the image and display an error message requesting a clearer photo
4. WHEN an uploaded image contains multiple faces THEN the Face_Validator SHALL prompt the user to select the primary face or upload a single-face image
5. WHEN a user uploads between 1 and 5 selfies THEN the Selfie_Upload_Handler SHALL accept all valid images for comprehensive analysis
6. IF an image file exceeds 10MB THEN the Image_Processor SHALL compress the image while maintaining sufficient quality for analysis
7. WHEN images are uploaded THEN the Selfie_Upload_Handler SHALL display upload progress and confirmation status

### Requirement 2: Face Shape Detection

**User Story:** As a user, I want the app to accurately detect my face shape, so that I receive hairstyle recommendations that complement my facial structure.

#### Acceptance Criteria

1. WHEN a valid selfie is processed THEN the Face_Analyzer SHALL detect facial landmarks including jawline, cheekbones, forehead, and chin
2. WHEN facial landmarks are detected THEN the Face_Analyzer SHALL classify the face shape into one of the following categories: oval, round, square, heart, oblong, or diamond
3. WHEN the Face_Analyzer completes classification THEN the System SHALL display the detected face shape to the user with a confidence score
4. WHEN the confidence score falls below 70% THEN the Face_Analyzer SHALL request additional selfies from different angles
5. WHEN a user disagrees with the detected face shape THEN the System SHALL allow manual override selection from available face shape options
6. THE Face_Analyzer SHALL use open-source AI models for face shape detection

### Requirement 3: Hair Characteristics Analysis

**User Story:** As a user, I want the app to analyze my hair characteristics, so that recommendations account for my hair's natural properties.

#### Acceptance Criteria

1. WHEN a valid selfie is processed THEN the Hair_Analyzer SHALL detect the user's hair region in the image
2. WHEN hair is detected THEN the Hair_Analyzer SHALL classify hair texture as straight, wavy, curly, or coily
3. WHEN hair is detected THEN the Hair_Analyzer SHALL estimate hair thickness as fine, medium, or thick
4. WHEN hair is detected THEN the Hair_Analyzer SHALL identify the current hairstyle category
5. WHEN the Hair_Analyzer completes analysis THEN the System SHALL display detected hair characteristics to the user
6. WHEN a user disagrees with detected hair characteristics THEN the System SHALL allow manual correction of texture and thickness values
7. THE Hair_Analyzer SHALL use open-source AI models for hair analysis

### Requirement 4: Hairstyle Recommendation Engine

**User Story:** As a user, I want to receive personalized hairstyle recommendations based on my face shape and hair characteristics, so that I can discover styles that suit me.

#### Acceptance Criteria

1. WHEN face shape and hair characteristics are determined THEN the Recommendation_Engine SHALL generate a list of compatible hairstyles
2. WHEN generating recommendations THEN the Recommendation_Engine SHALL apply styling rules that match face shapes to flattering hairstyle categories
3. WHEN generating recommendations THEN the Recommendation_Engine SHALL filter hairstyles based on hair texture compatibility
4. WHEN generating recommendations THEN the Recommendation_Engine SHALL filter hairstyles based on hair thickness requirements
5. WHEN recommendations are generated THEN the System SHALL display at least 5 hairstyle options ranked by compatibility score
6. WHEN displaying recommendations THEN the System SHALL show reference images and descriptions for each hairstyle
7. WHEN a user requests more options THEN the Recommendation_Engine SHALL provide additional compatible hairstyles beyond the initial set

### Requirement 5: Realistic Hairstyle Preview Generation

**User Story:** As a user, I want to see realistic previews of how recommended hairstyles would look on me, so that I can make informed decisions before committing to a style.

#### Acceptance Criteria

1. WHEN a user selects a recommended hairstyle THEN the Preview_Generator SHALL generate a preview image showing the user with that hairstyle
2. WHEN generating a preview THEN the Preview_Generator SHALL preserve the user's facial identity, skin tone, and facial features
3. WHEN generating a preview THEN the Preview_Generator SHALL modify only the hairstyle while keeping all other aspects unchanged
4. WHEN generating a preview THEN the Preview_Generator SHALL maintain realistic lighting and shadows consistent with the original image
5. WHEN a preview is generated THEN the System SHALL display the preview alongside the original image for comparison
6. IF preview generation fails THEN the System SHALL display an error message and offer to retry with a different source image
7. THE Preview_Generator SHALL use open-source AI models for identity-preserving hairstyle transfer
8. WHEN generating previews THEN the Preview_Generator SHALL complete generation within 30 seconds

### Requirement 6: Favorite Looks Management

**User Story:** As a user, I want to save and manage my favorite hairstyle previews, so that I can revisit them later and share with stylists.

#### Acceptance Criteria

1. WHEN a user taps the save button on a preview THEN the Favorites_Manager SHALL store the preview image and associated hairstyle details
2. WHEN a user accesses their favorites THEN the Favorites_Manager SHALL display all saved looks in a gallery view
3. WHEN viewing favorites THEN the System SHALL display the hairstyle name, save date, and preview image for each saved look
4. WHEN a user selects a saved favorite THEN the System SHALL display the full preview with hairstyle details and marketplace booking options
5. WHEN a user deletes a favorite THEN the Favorites_Manager SHALL remove the look from storage and update the gallery view
6. WHEN a user has no saved favorites THEN the System SHALL display an empty state with guidance to explore recommendations
7. THE Favorites_Manager SHALL persist saved looks across app sessions
8. WHEN a user shares a favorite look THEN the System SHALL generate a shareable link or image that stylists can view

### Requirement 7: Stylist Marketplace and Profiles

**User Story:** As a salon owner or barber, I want to create and manage my professional profile on the marketplace, so that I can attract clients seeking hairstyle services.

#### Acceptance Criteria

1. WHEN a stylist registers on the platform THEN the Marketplace SHALL create a professional profile with business details, location, and service offerings
2. WHEN a stylist sets up their profile THEN the System SHALL allow upload of portfolio images showcasing their work
3. WHEN a stylist configures services THEN the Marketplace SHALL allow specification of hairstyle specialties, pricing, and duration for each service
4. WHEN a stylist sets availability THEN the Scheduling_Manager SHALL store available time slots for booking
5. WHEN a stylist receives a booking request THEN the System SHALL send a notification with client details and requested hairstyle reference
6. WHEN a stylist views a booking request THEN the System SHALL display the client's saved hairstyle preview image
7. WHEN a stylist confirms or declines a booking THEN the System SHALL notify the client of the decision
8. WHEN a stylist completes a service THEN the System SHALL prompt the client to leave a rating and review
9. THE Marketplace SHALL display stylist ratings, reviews, and completed booking count on their profile

### Requirement 8: Marketplace Discovery and Search

**User Story:** As a user, I want to browse and search the stylist marketplace, so that I can find professionals who can achieve my desired hairstyle.

#### Acceptance Criteria

1. WHEN a user accesses the marketplace THEN the Discovery_Service SHALL request location permissions if not already granted
2. WHEN location is available THEN the Discovery_Service SHALL display stylists within a configurable radius sorted by relevance
3. WHEN displaying stylist listings THEN the System SHALL show profile photo, name, rating, distance, price range, and specialties
4. WHEN a user searches by hairstyle name THEN the Discovery_Service SHALL return stylists who specialize in that style
5. WHEN a user filters results THEN the Discovery_Service SHALL support filtering by rating, price range, distance, and availability
6. WHEN a user selects a stylist THEN the System SHALL display the full profile with portfolio, services, reviews, and booking options
7. IF location services are unavailable THEN the System SHALL allow manual location entry via address or zip code
8. WHEN a user has a saved favorite hairstyle THEN the Discovery_Service SHALL highlight stylists who specialize in that style

### Requirement 9: Booking and Appointment Management

**User Story:** As a user, I want to book appointments with stylists through the marketplace, so that I can schedule my haircut conveniently.

#### Acceptance Criteria

1. WHEN a user initiates booking from a stylist profile THEN the Booking_Handler SHALL display available appointment slots based on stylist availability
2. WHEN a user selects an appointment slot THEN the Booking_Handler SHALL reserve the slot temporarily and collect booking details
3. WHEN a user confirms booking THEN the Booking_Handler SHALL send the request to the stylist with the selected hairstyle reference image
4. WHEN a stylist confirms the booking THEN the System SHALL finalize the appointment and notify the user
5. WHEN booking is confirmed THEN the System SHALL display confirmation with appointment details and offer to add to device calendar
6. WHEN a user or stylist cancels a booking THEN the System SHALL notify the other party and release the time slot
7. WHEN an appointment time approaches THEN the System SHALL send reminder notifications to both user and stylist
8. WHEN a user has an upcoming appointment THEN the System SHALL display appointment details in a dedicated bookings section

### Requirement 10: Marketplace Messaging

**User Story:** As a user or stylist, I want to communicate through in-app messaging, so that I can discuss hairstyle details and appointment specifics.

#### Acceptance Criteria

1. WHEN a user initiates a conversation with a stylist THEN the Messaging_Service SHALL create a chat thread between the two parties
2. WHEN a message is sent THEN the Messaging_Service SHALL deliver the message and send a push notification to the recipient
3. WHEN a user shares a hairstyle preview in chat THEN the Messaging_Service SHALL display the image inline in the conversation
4. WHEN viewing a conversation THEN the System SHALL display message history with timestamps and read receipts
5. WHEN a booking is created THEN the System SHALL automatically create a chat thread for that appointment
6. THE Messaging_Service SHALL persist conversation history for reference during and after appointments

