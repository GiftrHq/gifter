//
//  APIEndpoint.swift
//  gifter
//
//  API Endpoint Protocol and HTTP Methods
//

import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

protocol APIEndpoint {
    var path: String { get }
    var method: HTTPMethod { get }
    var headers: [String: String]? { get }
    var queryItems: [URLQueryItem]? { get }
    var body: Encodable? { get }
    var requiresAuth: Bool { get }
}

// MARK: - Default Implementations
extension APIEndpoint {
    var headers: [String: String]? { nil }
    var queryItems: [URLQueryItem]? { nil }
    var body: Encodable? { nil }
    var requiresAuth: Bool { true }
}

// MARK: - Auth Endpoints
enum AuthEndpoint: APIEndpoint {
    case signUp(email: String, password: String, name: String)
    case signIn(email: String, password: String)
    case signInWithApple(idToken: String, nonce: String)
    case signOut
    case getSession
    case verifyEmail(token: String)
    case forgotPassword(email: String)
    case resetPassword(token: String, password: String)
    case magicLink(email: String)

    var path: String {
        switch self {
        case .signUp:
            return "/api/auth/sign-up/email"
        case .signIn:
            return "/api/auth/sign-in/email"
        case .signInWithApple:
            return "/api/auth/sign-in/social"
        case .signOut:
            return "/api/auth/sign-out"
        case .getSession:
            return "/api/auth/get-session"
        case .verifyEmail:
            return "/api/auth/verify-email"
        case .forgotPassword:
            return "/api/auth/forgot-password"
        case .resetPassword:
            return "/api/auth/reset-password"
        case .magicLink:
            return "/api/auth/magic-link"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getSession:
            return .get
        default:
            return .post
        }
    }

    var body: Encodable? {
        switch self {
        case .signUp(let email, let password, let name):
            return SignUpRequest(email: email, password: password, name: name)
        case .signIn(let email, let password):
            return SignInRequest(email: email, password: password)
        case .signInWithApple(let idToken, let nonce):
            return AppleSignInRequest(idToken: idToken, nonce: nonce, provider: "apple")
        case .verifyEmail(let token):
            return VerifyEmailRequest(token: token)
        case .forgotPassword(let email):
            return ForgotPasswordRequest(email: email)
        case .resetPassword(let token, let password):
            return ResetPasswordRequest(token: token, newPassword: password)
        case .magicLink(let email):
            return MagicLinkRequest(email: email)
        case .signOut, .getSession:
            return nil
        }
    }

    var requiresAuth: Bool {
        switch self {
        case .signUp, .signIn, .signInWithApple, .verifyEmail, .forgotPassword, .resetPassword, .magicLink:
            return false
        case .signOut, .getSession:
            return true
        }
    }
}

// MARK: - User Endpoints
enum UserEndpoint: APIEndpoint {
    case getMe
    case updateMe(UpdateUserRequest)
    case addDevice(token: String, platform: String)
    case removeDevice(token: String)

    var path: String {
        switch self {
        case .getMe, .updateMe:
            return "/v1/me"
        case .addDevice:
            return "/v1/me/device"
        case .removeDevice(let token):
            return "/v1/me/device/\(token)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getMe:
            return .get
        case .updateMe:
            return .patch
        case .addDevice:
            return .post
        case .removeDevice:
            return .delete
        }
    }

    var body: Encodable? {
        switch self {
        case .updateMe(let request):
            return request
        case .addDevice(let token, let platform):
            return AddDeviceRequest(token: token, platform: platform)
        default:
            return nil
        }
    }
}

// MARK: - Onboarding Endpoints
enum OnboardingEndpoint: APIEndpoint {
    case start(scenario: String)
    case getQuestions
    case submitAnswer(questionId: String, answer: String)
    case complete
    case getStatus
    case updateIdentity(UpdateIdentityRequest)

    var path: String {
        switch self {
        case .start:
            return "/v1/onboarding/start"
        case .getQuestions:
            return "/v1/onboarding/questions"
        case .submitAnswer:
            return "/v1/onboarding/answer"
        case .complete:
            return "/v1/onboarding/complete"
        case .getStatus:
            return "/v1/onboarding/status"
        case .updateIdentity:
            return "/v1/onboarding/identity"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getQuestions, .getStatus:
            return .get
        default:
            return .post
        }
    }

    var body: Encodable? {
        switch self {
        case .start(let scenario):
            return OnboardingStartRequest(scenario: scenario)
        case .submitAnswer(let questionId, let answer):
            return OnboardingAnswerRequest(questionId: questionId, answer: answer)
        case .updateIdentity(let request):
            return request
        default:
            return nil
        }
    }
}

// MARK: - Product Endpoints
enum ProductEndpoint: APIEndpoint {
    case search(query: String?, category: String?, limit: Int, offset: Int)
    case getProduct(id: String)
    case getRecommendations(limit: Int)
    case getRecommendationsForOccasion(occasionId: String, limit: Int)

    var path: String {
        switch self {
        case .search:
            return "/v1/products"
        case .getProduct(let id):
            return "/v1/products/\(id)"
        case .getRecommendations:
            return "/v1/recommendations"
        case .getRecommendationsForOccasion(let occasionId, _):
            return "/v1/recommendations/\(occasionId)"
        }
    }

    var method: HTTPMethod { .get }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .search(let query, let category, let limit, let offset):
            var items: [URLQueryItem] = [
                URLQueryItem(name: "limit", value: String(limit)),
                URLQueryItem(name: "offset", value: String(offset))
            ]
            if let query = query {
                items.append(URLQueryItem(name: "q", value: query))
            }
            if let category = category {
                items.append(URLQueryItem(name: "category", value: category))
            }
            return items
        case .getRecommendations(let limit), .getRecommendationsForOccasion(_, let limit):
            return [URLQueryItem(name: "limit", value: String(limit))]
        default:
            return nil
        }
    }
}

// MARK: - Collection Endpoints
enum CollectionEndpoint: APIEndpoint {
    case getCollections(limit: Int)
    case getCollection(id: String)
    case getCollectionProducts(id: String, limit: Int, offset: Int)

    var path: String {
        switch self {
        case .getCollections:
            return "/v1/collections"
        case .getCollection(let id):
            return "/v1/collections/\(id)"
        case .getCollectionProducts(let id, _, _):
            return "/v1/collections/\(id)/products"
        }
    }

    var method: HTTPMethod { .get }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .getCollections(let limit):
            return [URLQueryItem(name: "limit", value: String(limit))]
        case .getCollectionProducts(_, let limit, let offset):
            return [
                URLQueryItem(name: "limit", value: String(limit)),
                URLQueryItem(name: "offset", value: String(offset))
            ]
        default:
            return nil
        }
    }
}

// MARK: - Occasion Endpoints
enum OccasionEndpoint: APIEndpoint {
    case getOccasions
    case createOccasion(CreateOccasionRequest)
    case updateOccasion(id: String, UpdateOccasionRequest)
    case deleteOccasion(id: String)

    var path: String {
        switch self {
        case .getOccasions:
            return "/v1/occasions"
        case .createOccasion:
            return "/v1/occasions"
        case .updateOccasion(let id, _), .deleteOccasion(let id):
            return "/v1/occasions/\(id)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getOccasions:
            return .get
        case .createOccasion:
            return .post
        case .updateOccasion:
            return .patch
        case .deleteOccasion:
            return .delete
        }
    }

    var body: Encodable? {
        switch self {
        case .createOccasion(let request):
            return request
        case .updateOccasion(_, let request):
            return request
        default:
            return nil
        }
    }
}

// MARK: - Recipient Endpoints
enum RecipientEndpoint: APIEndpoint {
    case getRecipients
    case createRecipient(CreateRecipientRequest)
    case updateRecipient(id: String, UpdateRecipientRequest)
    case deleteRecipient(id: String)

    var path: String {
        switch self {
        case .getRecipients:
            return "/v1/recipients"
        case .createRecipient:
            return "/v1/recipients"
        case .updateRecipient(let id, _), .deleteRecipient(let id):
            return "/v1/recipients/\(id)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getRecipients:
            return .get
        case .createRecipient:
            return .post
        case .updateRecipient:
            return .patch
        case .deleteRecipient:
            return .delete
        }
    }

    var body: Encodable? {
        switch self {
        case .createRecipient(let request):
            return request
        case .updateRecipient(_, let request):
            return request
        default:
            return nil
        }
    }
}

// MARK: - Wishlist Endpoints
enum WishlistEndpoint: APIEndpoint {
    case getWishlists
    case createWishlist(CreateWishlistRequest)
    case addItem(wishlistId: String, productId: String)
    case removeItem(wishlistId: String, itemId: String)

    var path: String {
        switch self {
        case .getWishlists:
            return "/v1/wishlists"
        case .createWishlist:
            return "/v1/wishlists"
        case .addItem(let wishlistId, _):
            return "/v1/wishlists/\(wishlistId)/items"
        case .removeItem(let wishlistId, let itemId):
            return "/v1/wishlists/\(wishlistId)/items/\(itemId)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getWishlists:
            return .get
        case .createWishlist, .addItem:
            return .post
        case .removeItem:
            return .delete
        }
    }

    var body: Encodable? {
        switch self {
        case .createWishlist(let request):
            return request
        case .addItem(_, let productId):
            return AddWishlistItemRequest(productId: productId)
        default:
            return nil
        }
    }
}
