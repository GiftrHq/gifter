//
//  ProfileView.swift
//  gifter
//
//  Profile/You Tab
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showTasteProfile = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("You & I")
                            .gifterDisplayL()

                        Text("This is where I remember the things that matter to your gifting life.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.top, 20)

                    // You section
                    VStack(alignment: .leading, spacing: 16) {
                        sectionHeader("You")

                        GifterCard {
                            HStack(spacing: 16) {
                                Circle()
                                    .fill(GifterColors.gifterSoftGray)
                                    .frame(width: 60, height: 60)
                                    .overlay(
                                        Text(String(appState.currentUser?.firstName.prefix(1) ?? "?"))
                                            .font(.system(size: 24, weight: .medium))
                                            .foregroundColor(GifterColors.gifterWhite)
                                    )

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(appState.currentUser?.fullName ?? "Guest")
                                        .font(.system(size: 18, weight: .medium))
                                        .foregroundColor(GifterColors.gifterWhite)

                                    Text(appState.currentUser?.email ?? "")
                                        .font(.system(size: 14))
                                        .foregroundColor(GifterColors.gifterGray)
                                }

                                Spacer()
                            }
                            .padding(20)
                        }
                        .padding(.horizontal, 24)
                    }

                    // Your taste section
                    VStack(alignment: .leading, spacing: 16) {
                        sectionHeader("Your taste")

                        if let tasteProfile = appState.currentUser?.tasteProfile, tasteProfile.isComplete {
                            VStack(spacing: 12) {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(tasteProfile.summary, id: \.self) { item in
                                            GifterPill(text: item, style: .outlined)
                                        }
                                    }
                                    .padding(.horizontal, 24)
                                }

                                GifterButton(title: "Refine my taste", style: .secondary) {
                                    showTasteProfile = true
                                }
                                .padding(.horizontal, 24)
                            }
                        } else {
                            GifterButton(title: "Set up my taste profile", style: .primary) {
                                showTasteProfile = true
                            }
                            .padding(.horizontal, 24)
                        }
                    }

                    // Notifications section
                    VStack(alignment: .leading, spacing: 16) {
                        sectionHeader("Notifications")

                        VStack(spacing: 0) {
                            SettingsToggleRow(
                                title: "Remind me a week before",
                                isOn: .constant(true)
                            )

                            Divider()
                                .background(GifterColors.gifterSoftGray)
                                .padding(.leading, 24)

                            SettingsToggleRow(
                                title: "Remind me on the day",
                                isOn: .constant(true)
                            )
                        }
                    }

                    // About section
                    VStack(alignment: .leading, spacing: 16) {
                        sectionHeader("About")

                        VStack(spacing: 0) {
                            SettingsLinkRow(title: "Privacy Policy")
                            Divider()
                                .background(GifterColors.gifterSoftGray)
                                .padding(.leading, 24)

                            SettingsLinkRow(title: "Terms of Service")
                            Divider()
                                .background(GifterColors.gifterSoftGray)
                                .padding(.leading, 24)

                            SettingsLinkRow(title: "About Gifter")
                        }
                    }

                    // Logout button
                    Button(action: {
                        appState.logout()
                    }) {
                        Text("Log out")
                            .font(.system(size: 15))
                            .foregroundColor(.red)
                    }
                    .padding(.top, 16)

                    Spacer(minLength: 100)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Image("logo")
                    .resizable()
                    .renderingMode(.template)
                    .foregroundColor(GifterColors.gifterWhite)
                    .frame(width: 24, height: 24)
            }
        }
        .fullScreenCover(isPresented: $showTasteProfile) {
            TasteProfileView(mode: .userLight)
        }
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(GifterColors.gifterGray)
            .textCase(.uppercase)
            .padding(.horizontal, 24)
    }
}

struct SettingsToggleRow: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            Text(title)
                .gifterBody()

            Spacer()

            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(GifterColors.gifterWhite)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
        .contentShape(Rectangle())
    }
}

struct SettingsLinkRow: View {
    let title: String

    var body: some View {
        Button(action: {
            // Handle navigation
        }) {
            HStack {
                Text(title)
                    .gifterBody()

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .contentShape(Rectangle())
        }
    }
}
