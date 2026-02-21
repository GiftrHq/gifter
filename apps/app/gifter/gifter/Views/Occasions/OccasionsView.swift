//
//  OccasionsView.swift
//  gifter
//
//  Occasions Tab
//

import SwiftUI

struct OccasionsView: View {
    @StateObject private var viewModel = OccasionsViewModel()
    @State private var showAddOccasion = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.nextTwoWeeks.isEmpty && viewModel.later.isEmpty {
                ProgressView()
                    .tint(GifterColors.gifterWhite)
            } else {
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

                        // Coming up soon
                        if !viewModel.nextTwoWeeks.isEmpty {
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Coming up soon")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(GifterColors.gifterGray)
                                    .textCase(.uppercase)
                                    .padding(.horizontal, 24)

                                VStack(spacing: 0) {
                                    ForEach(viewModel.nextTwoWeeks) { occasion in
                                        NavigationLink(destination: OccasionDetailView(occasion: occasion)) {
                                            OccasionRow(occasion: occasion)
                                        }
                                        .buttonStyle(PlainButtonStyle())

                                        if occasion.id != viewModel.nextTwoWeeks.last?.id {
                                            Divider()
                                                .background(GifterColors.gifterSoftGray)
                                                .padding(.leading, 80)
                                        }
                                    }
                                }
                            }
                        }

                        // Later
                        if !viewModel.later.isEmpty {
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Later")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(GifterColors.gifterGray)
                                    .textCase(.uppercase)
                                    .padding(.horizontal, 24)

                                VStack(spacing: 0) {
                                    ForEach(viewModel.later) { occasion in
                                        NavigationLink(destination: OccasionDetailView(occasion: occasion)) {
                                            OccasionRow(occasion: occasion)
                                        }
                                        .buttonStyle(PlainButtonStyle())

                                        if occasion.id != viewModel.later.last?.id {
                                            Divider()
                                                .background(GifterColors.gifterSoftGray)
                                                .padding(.leading, 80)
                                        }
                                    }
                                }
                            }
                        }

                        if viewModel.nextTwoWeeks.isEmpty && viewModel.later.isEmpty && !viewModel.isLoading {
                            VStack(spacing: 16) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 48))
                                    .foregroundColor(GifterColors.gifterGray)
                                
                                Text("No occasions yet")
                                    .gifterBody()
                                    .foregroundColor(GifterColors.gifterGray)
                            }
                            .padding(.top, 60)
                        }

                        Spacer(minLength: 100)
                    }
                }
                .refreshable {
                    await viewModel.loadFeed()
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
            
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showAddOccasion = true
                } label: {
                    Image(systemName: "plus")
                        .foregroundColor(GifterColors.gifterWhite)
                }
            }
        }
        .sheet(isPresented: $showAddOccasion) {
            NavigationView {
                MakeOccasionView(mode: .create) { newOccasion in
                    viewModel.addOccasion(newOccasion)
                }
            }
        }
        .task {
            await viewModel.loadFeed()
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
