//
//  AddressService.swift
//  gifter
//
//  Address Service
//

import Foundation

final class AddressService {
    static let shared = AddressService()
    
    private let client = APIClient.shared
    
    private init() {}
    
    // MARK: - Addresses
    
    func getAddresses() async throws -> [Address] {
        let response: AddressListResponse = try await client.request(AddressEndpoint.getAddresses)
        return response.addresses.map { $0.toDomain() }
    }
    
    func createAddress(
        label: String? = nil,
        line1: String,
        line2: String? = nil,
        city: String,
        state: String? = nil,
        postalCode: String,
        country: String,
        phoneNumber: String? = nil,
        isDefault: Bool? = nil
    ) async throws -> Address {
        let request = CreateAddressRequest(
            label: label,
            line1: line1,
            line2: line2,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            phoneNumber: phoneNumber,
            isDefault: isDefault
        )
        
        let response: AddressDTO = try await client.request(AddressEndpoint.createAddress(request))
        return response.toDomain()
    }
    
    func updateAddress(
        id: String,
        label: String? = nil,
        line1: String? = nil,
        line2: String? = nil,
        city: String? = nil,
        state: String? = nil,
        postalCode: String? = nil,
        country: String? = nil,
        phoneNumber: String? = nil,
        isDefault: Bool? = nil
    ) async throws -> Address {
        let request = UpdateAddressRequest(
            label: label,
            line1: line1,
            line2: line2,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            phoneNumber: phoneNumber,
            isDefault: isDefault
        )
        
        let response: AddressDTO = try await client.request(AddressEndpoint.updateAddress(id: id, request))
        return response.toDomain()
    }
    
    func deleteAddress(id: String) async throws {
        try await client.request(AddressEndpoint.deleteAddress(id: id))
    }
}
