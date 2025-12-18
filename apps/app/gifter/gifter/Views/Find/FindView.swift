//
//  FindView.swift
//  gifter
//
//  Find Tab - Find Someone a Gift
//

import SwiftUI

struct FindView: View {
    @State private var searchText = ""
    @State private var giftingProfiles = MockData.giftingProfiles
    @State private var showNewProfile = false

    var filteredProfiles: [GiftingProfile] {
        if searchText.isEmpty {
            return giftingProfiles
        }
        return giftingProfiles.filter {
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Who are we shopping for?")
                        .gifterDisplayL()

                    Text("Search by name, or create a quick gifting profile.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.top, 20)

                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(GifterColors.gifterGray)

                    TextField("Search people", text: $searchText)
                        .font(GifterTypography.body())
                        .foregroundColor(GifterColors.gifterWhite)
                }
                .padding()
                .background(GifterColors.gifterOffBlack)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
                )
                .padding(.horizontal, 24)
                .padding(.top, 24)

                ScrollView {
                    VStack(spacing: 24) {
                        // Recent profiles
                        if !filteredProfiles.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("People you gift most")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(GifterColors.gifterGray)
                                    .textCase(.uppercase)
                                    .padding(.horizontal, 24)

                                VStack(spacing: 0) {
                                    ForEach(filteredProfiles) { profile in
                                        NavigationLink(destination: RecommendationsView(profile: profile)) {
                                            ProfileRow(profile: profile)
                                        }
                                        .buttonStyle(PlainButtonStyle())

                                        if profile.id != filteredProfiles.last?.id {
                                            Divider()
                                                .background(GifterColors.gifterSoftGray)
                                                .padding(.leading, 80)
                                        }
                                    }
                                }
                            }
                        }

                        // Create new profile button
                        GifterButton(title: "Create a new gifting profile", style: .secondary) {
                            showNewProfile = true
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 16)

                        Spacer(minLength: 100)
                    }
                    .padding(.top, 24)
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
        .sheet(isPresented: $showNewProfile) {
            NewProfileView { newProfile in
                giftingProfiles.insert(newProfile, at: 0)
            }
        }
    }
}

struct ProfileRow: View {
    let profile: GiftingProfile

    var body: some View {
        HStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(GifterColors.gifterSoftGray)
                .frame(width: 48, height: 48)
                .overlay(
                    Text(String(profile.name.prefix(1)))
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(GifterColors.gifterWhite)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(profile.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)

                Text(profile.relationship)
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)

                if let lastGiftedText = profile.lastGiftedText {
                    Text(lastGiftedText)
                        .font(.system(size: 12))
                        .foregroundColor(GifterColors.gifterGray)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(GifterColors.gifterGray)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}
