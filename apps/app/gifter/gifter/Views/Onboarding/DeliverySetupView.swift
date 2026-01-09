//
//  DeliverySetupView.swift
//  gifter
//
//  Step 2 of Onboarding: Collect Phone and Address
//

import SwiftUI

struct DeliverySetupView: View {
    @EnvironmentObject var appState: AppState
    @State private var phone = ""
    @State private var line1 = ""
    @State private var line2 = ""
    @State private var city = ""
    @State private var state = ""
    @State private var postalCode = ""
    @State private var country = "United Kingdom"
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var onNext: () -> Void

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    VStack(spacing: 16) {
                        Text("Where should gifts go?")
                            .gifterDisplayL()
                            .multilineTextAlignment(.center)

                        Text("Friends can send gifts directly to this address without seeing it.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .multilineTextAlignment(.center)
                    }

                    VStack(spacing: 16) {
                        CustomTextField(placeholder: "Phone number", text: $phone)
                            .keyboardType(.phonePad)
                        
                        Divider().background(GifterColors.gifterSoftGray)
                        
                        CustomTextField(placeholder: "Address Line 1", text: $line1)
                        CustomTextField(placeholder: "Address Line 2 (Optional)", text: $line2)
                        
                        HStack(spacing: 16) {
                            CustomTextField(placeholder: "City", text: $city)
                            CustomTextField(placeholder: "State / County", text: $state)
                        }
                        
                        HStack(spacing: 16) {
                            CustomTextField(placeholder: "Postal Code", text: $postalCode)
                            CustomTextField(placeholder: "Country", text: $country)
                        }
                    }

                    if let error = errorMessage {
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                    }

                    GifterButton(title: isLoading ? "Saving..." : "Continue", style: .primary) {
                        saveDeliveryInfo()
                    }
                    .disabled(isLoading || !isFormValid)
                    .opacity(isFormValid ? 1.0 : 0.5)
                }
                .padding(.horizontal, 32)
                .padding(.top, 60)
                .padding(.bottom, 40)
            }
        }
    }

    private var isFormValid: Bool {
        !phone.isEmpty && !line1.isEmpty && !city.isEmpty && !postalCode.isEmpty
    }

    private func saveDeliveryInfo() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Call the new production-ready identity service method
                let addressDTO = AddressDTO(
                    line1: line1,
                    line2: line2.isEmpty ? nil : line2,
                    city: city,
                    state: state.isEmpty ? nil : state,
                    postalCode: postalCode,
                    country: country
                )
                
                try await OnboardingService.shared.updateIdentity(
                    phone: phone,
                    address: addressDTO,
                    step: 2
                )
                
                isLoading = false
                onNext()
            } catch {
                isLoading = false
                errorMessage = "Failed to save delivery info. Please try again."
                print("Delivery setup error: \(error)")
            }
        }
    }
}

