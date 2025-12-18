//
//  OccasionsView.swift
//  gifter
//
//  Occasions Tab
//

import SwiftUI

struct OccasionsView: View {
    @State private var occasions = MockData.occasions

    var thisMonthOccasions: [Occasion] {
        occasions.filter { $0.daysUntil <= 31 && $0.daysUntil >= 0 }
    }

    var laterOccasions: [Occasion] {
        occasions.filter { $0.daysUntil > 31 }
    }

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Let's not forget anyone.")
                            .gifterDisplayL()

                        Text("I'll nudge you before each big day, but you can start planning anytime.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.top, 20)

                    // This month
                    if !thisMonthOccasions.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("This month")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GifterColors.gifterGray)
                                .textCase(.uppercase)
                                .padding(.horizontal, 24)

                            VStack(spacing: 0) {
                                ForEach(thisMonthOccasions) { occasion in
                                    NavigationLink(destination: OccasionDetailView(occasion: occasion)) {
                                        OccasionRow(occasion: occasion)
                                    }
                                    .buttonStyle(PlainButtonStyle())

                                    if occasion.id != thisMonthOccasions.last?.id {
                                        Divider()
                                            .background(GifterColors.gifterSoftGray)
                                            .padding(.leading, 80)
                                    }
                                }
                            }
                        }
                    }

                    // Later
                    if !laterOccasions.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Later")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GifterColors.gifterGray)
                                .textCase(.uppercase)
                                .padding(.horizontal, 24)

                            VStack(spacing: 0) {
                                ForEach(laterOccasions) { occasion in
                                    NavigationLink(destination: OccasionDetailView(occasion: occasion)) {
                                        OccasionRow(occasion: occasion)
                                    }
                                    .buttonStyle(PlainButtonStyle())

                                    if occasion.id != laterOccasions.last?.id {
                                        Divider()
                                            .background(GifterColors.gifterSoftGray)
                                            .padding(.leading, 80)
                                    }
                                }
                            }
                        }
                    }

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
    }
}

struct OccasionRow: View {
    let occasion: Occasion

    var body: some View {
        HStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(GifterColors.gifterSoftGray)
                .frame(width: 48, height: 48)
                .overlay(
                    Text(String(occasion.personName.prefix(1)))
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(GifterColors.gifterWhite)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text("\(occasion.personName) · \(occasion.relationship)")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)

                Text("\(occasion.occasionType) · \(occasion.formattedDate)")
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)
            }

            Spacer()

            GifterPill(text: occasion.status.rawValue, style: .outlined)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}
