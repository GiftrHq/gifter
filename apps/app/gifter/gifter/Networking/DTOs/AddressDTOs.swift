//
//  AddressDTOs.swift
//  gifter
//
//  Address Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct CreateAddressRequest: Codable {
    let label: String?
    let line1: String
    let line2: String?
    let city: String
    let state: String?
    let postalCode: String
    let country: String
    let phoneNumber: String?
    let isDefault: Bool?
}

struct UpdateAddressRequest: Codable {
    let label: String?
    let line1: String?
    let line2: String?
    let city: String?
    let state: String?
    let postalCode: String?
    let country: String?
    let phoneNumber: String?
    let isDefault: Bool?
}

// MARK: - Responses

struct AddressDTO: Codable {
    let id: String
    let userId: String
    let label: String?
    let line1: String
    let line2: String?
    let city: String
    let state: String?
    let postalCode: String
    let country: String
    let phoneNumber: String?
    let isDefault: Bool
    let createdAt: String
    let updatedAt: String
    
    func toDomain() -> Address {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        return Address(
            id: id,
            label: label,
            line1: line1,
            line2: line2,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            phoneNumber: phoneNumber,
            isDefault: isDefault,
            createdAt: dateFormatter.date(from: createdAt) ?? Date(),
            updatedAt: dateFormatter.date(from: updatedAt) ?? Date()
        )
    }
}

struct AddressListResponse: Decodable {
    let addresses: [AddressDTO]
    
    private enum CodingKeys: String, CodingKey {
        case addresses
    }
    
    init(from decoder: Decoder) throws {
        // Handle both array and object responses
        if let array = try? decoder.singleValueContainer().decode([AddressDTO].self) {
            self.addresses = array
        } else {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.addresses = try container.decode([AddressDTO].self, forKey: .addresses)
        }
    }
}
