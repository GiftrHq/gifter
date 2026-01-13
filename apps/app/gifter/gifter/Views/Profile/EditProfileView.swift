//
//  EditProfileView.swift
//  gifter
//
//  Profile Editing View
//

import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var firstName: String = ""
    @State private var lastName: String = ""
    @State private var email: String = ""
    @State private var phone: String = ""
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
                        Text("Edit Profile")
                            .gifterDisplayL()
                        
                        Text("Update your personal information")
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
                                    Text("First Name")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("First Name", text: $firstName)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Last Name")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Last Name", text: $lastName)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Email")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Email", text: $email)
                                        .textFieldStyle(GifterTextFieldStyle())
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                        .disabled(true) // Email typically not editable
                                        .opacity(0.6)
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Phone")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("Phone (optional)", text: $phone)
                                        .textFieldStyle(GifterTextFieldStyle())
                                        .keyboardType(.phonePad)
                                }
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
                            title: isLoading ? "Saving..." : "Save Changes",
                            style: .primary
                        ) {
                            Task {
                                await saveProfile()
                            }
                        }
                        .padding(.horizontal, 24)
                        .disabled(isLoading)
                    }
                    
                    Spacer(minLength: 100)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            // Header is already handled by ScrollView content
        }
        .onAppear {
            loadCurrentProfile()
        }
    }
    
    private func loadCurrentProfile() {
        if let user = appState.currentUser {
            firstName = user.firstName
            lastName = user.lastName
            email = user.email
            phone = "" // Phone not currently in User model, would need to add
        }
    }
    
    private func saveProfile() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let fullName = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
            let updatedUser = try await UserService.shared.updateProfile(
                name: fullName.isEmpty ? nil : fullName,
                phone: phone.isEmpty ? nil : phone
            )
            
            await MainActor.run {
                appState.currentUser = updatedUser
                isLoading = false
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to update profile. Please try again."
                isLoading = false
            }
        }
    }
}

// MARK: - Custom TextField Style
struct GifterTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(16)
            .background(GifterColors.gifterSoftGray.opacity(0.3))
            .cornerRadius(12)
            .foregroundColor(GifterColors.gifterWhite)
            .font(.system(size: 16))
    }
}
