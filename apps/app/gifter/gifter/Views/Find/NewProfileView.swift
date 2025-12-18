//
//  NewProfileView.swift
//  gifter
//
//  Create New Gifting Profile
//

import SwiftUI

struct NewProfileView: View {
    @Environment(\.dismiss) var dismiss
    var onComplete: (GiftingProfile) -> Void

    @State private var name = ""
    @State private var relationship = "Friend"
    @State private var word1 = ""
    @State private var word2 = ""
    @State private var word3 = ""
    @State private var showTasteProfile = false
    @State private var createdProfile: GiftingProfile?

    let relationships = ["Friend", "Partner", "Parent", "Sibling", "Colleague", "Other"]

    var body: some View {
        NavigationStack {
            ZStack {
                GifterColors.gifterBlack
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        VStack(spacing: 16) {
                            Text("Tell me who they are.")
                                .gifterDisplayL()

                            Text("Just enough so I don't recommend socks to the friend who hates socks.")
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 20)

                        VStack(spacing: 16) {
                            CustomTextField(placeholder: "Name", text: $name)

                            // Relationship picker
                            Menu {
                                ForEach(relationships, id: \.self) { rel in
                                    Button(rel) {
                                        relationship = rel
                                    }
                                }
                            } label: {
                                HStack {
                                    Text(relationship)
                                        .font(GifterTypography.body())
                                        .foregroundColor(GifterColors.gifterWhite)

                                    Spacer()

                                    Image(systemName: "chevron.down")
                                        .foregroundColor(GifterColors.gifterGray)
                                        .font(.system(size: 14))
                                }
                                .padding()
                                .background(GifterColors.gifterOffBlack)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
                                )
                            }

                            VStack(alignment: .leading, spacing: 12) {
                                Text("Three words that come to mind")
                                    .gifterCaption()

                                CustomTextField(placeholder: "Word 1", text: $word1)
                                CustomTextField(placeholder: "Word 2", text: $word2)
                                CustomTextField(placeholder: "Word 3", text: $word3)
                            }
                        }

                        GifterButton(title: "Continue", style: .primary) {
                            handleContinue()
                        }
                        .disabled(!isFormValid)
                        .opacity(isFormValid ? 1.0 : 0.5)
                    }
                    .padding(.horizontal, 32)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(GifterColors.gifterWhite)
                    }
                }

                ToolbarItem(placement: .principal) {
                    Image("logo")
                        .resizable()
                        .renderingMode(.template)
                        .foregroundColor(GifterColors.gifterWhite)
                        .frame(width: 24, height: 24)
                }
            }
        }
        .fullScreenCover(isPresented: $showTasteProfile) {
            if let profile = createdProfile {
                TasteProfileView(mode: .nonUser)
                    .onDisappear {
                        onComplete(profile)
                        dismiss()
                    }
            }
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty && !word1.isEmpty
    }

    private func handleContinue() {
        let threeWords = [word1, word2, word3].filter { !$0.isEmpty }

        let newProfile = GiftingProfile(
            id: UUID().uuidString,
            name: name,
            relationship: relationship,
            threeWords: threeWords,
            tasteProfile: nil,
            savedProducts: [],
            lastGifted: nil,
            createdAt: Date()
        )

        createdProfile = newProfile
        showTasteProfile = true
    }
}
