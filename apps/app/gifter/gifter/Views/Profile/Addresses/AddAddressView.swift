//
//  AddAddressView.swift
//  gifter
//
//  Create/Edit Address View
//

import SwiftUI

enum AddressMode {
    case create
    case edit(Address)
}

struct AddAddressView: View {
    @Environment(\.dismiss) var dismiss
    
    let mode: AddressMode
    let onSave: (Address) -> Void
    
    @State private var label: String = "Home"
    @State private var line1: String = ""
    @State private var line2: String = ""
    @State private var city: String = ""
    @State private var state: String = ""
    @State private var postalCode: String = ""
    @State private var country: String = "United Kingdom"
    @State private var phoneNumber: String = ""
    @State private var isDefault: Bool = false
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(isEditMode ? "Edit Address" : "New Address")
                            .gifterDisplayL()
                        
                        Text("Add a shipping or billing address")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    
                    // Form
                    VStack(spacing: 16) {
                        GifterCard {
                            VStack(spacing: 20) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Label")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("e.g., Home, Work, Office", text: $label)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Address Line 1")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Street address", text: $line1)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Address Line 2 (Optional)")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Apartment, suite, etc.", text: $line2)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                
                                HStack(spacing: 12) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("City")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(GifterColors.gifterGray)
                                            .textCase(.uppercase)
                                        
                                        TextField("City", text: $city)
                                            .textFieldStyle(GifterTextFieldStyle())
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("State/County")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(GifterColors.gifterGray)
                                            .textCase(.uppercase)
                                        
                                        TextField("State", text: $state)
                                            .textFieldStyle(GifterTextFieldStyle())
                                    }
                                }
                                
                                HStack(spacing: 12) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Postal Code")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(GifterColors.gifterGray)
                                            .textCase(.uppercase)
                                        
                                        TextField("Postal Code", text: $postalCode)
                                            .textFieldStyle(GifterTextFieldStyle())
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Country")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(GifterColors.gifterGray)
                                            .textCase(.uppercase)
                                        
                                        TextField("Country", text: $country)
                                            .textFieldStyle(GifterTextFieldStyle())
                                    }
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Phone Number (Optional)")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Phone number", text: $phoneNumber)
                                        .textFieldStyle(GifterTextFieldStyle())
                                        .keyboardType(.phonePad)
                                }
                                
                                Toggle(isOn: $isDefault) {
                                    Text("Set as default address")
                                        .font(.system(size: 16))
                                        .foregroundColor(GifterColors.gifterWhite)
                                }
                                .tint(GifterColors.gifterWhite)
                            }
                            .padding(20)
                        }
                        .padding(.horizontal, 24)
                        
                        if let errorMessage = errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 14))
                                .foregroundColor(.red)
                                .padding(.horizontal, 24)
                        }
                        
                        GifterButton(
                            title: isLoading ? "Saving..." : "Save Address",
                            style: .primary,
                        ) {
                            Task {
                                await saveAddress()
                            }
                        }
                        .padding(.horizontal, 24)
                        .disabled(isLoading || !isFormValid)
                    }
                    
                    Spacer(minLength: 100)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancel") {
                    dismiss()
                }
                .foregroundColor(GifterColors.gifterWhite)
            }
        }
        .onAppear {
            loadAddressData()
        }
    }
    
    private var isEditMode: Bool {
        if case .edit = mode {
            return true
        }
        return false
    }
    
    private var isFormValid: Bool {
        !line1.isEmpty && !city.isEmpty && !postalCode.isEmpty && !country.isEmpty
    }
    
    private func loadAddressData() {
        if case .edit(let address) = mode {
            label = address.label ?? "Home"
            line1 = address.line1
            line2 = address.line2 ?? ""
            city = address.city
            state = address.state ?? ""
            postalCode = address.postalCode
            country = address.country
            phoneNumber = address.phoneNumber ?? ""
            isDefault = address.isDefault
        }
    }
    
    private func saveAddress() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let savedAddress: Address
            
            if case .edit(let existingAddress) = mode {
                // Update existing address
                savedAddress = try await AddressService.shared.updateAddress(
                    id: existingAddress.id,
                    label: label,
                    line1: line1,
                    line2: line2.isEmpty ? nil : line2,
                    city: city,
                    state: state.isEmpty ? nil : state,
                    postalCode: postalCode,
                    country: country,
                    phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
                    isDefault: isDefault
                )
            } else {
                // Create new address
                savedAddress = try await AddressService.shared.createAddress(
                    label: label,
                    line1: line1,
                    line2: line2.isEmpty ? nil : line2,
                    city: city,
                    state: state.isEmpty ? nil : state,
                    postalCode: postalCode,
                    country: country,
                    phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
                    isDefault: isDefault
                )
            }
            
            await MainActor.run {
                onSave(savedAddress)
                isLoading = false
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to save address. Please try again."
                isLoading = false
            }
        }
    }
}
