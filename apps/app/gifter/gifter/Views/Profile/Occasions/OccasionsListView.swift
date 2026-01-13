//
//  OccasionsListView.swift
//  gifter
//
//  Occasions Management View
//

import SwiftUI

struct OccasionsListView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = OccasionsViewModel()
    @State private var showAddOccasion = false
    @State private var selectedOccasion: Occasion?
    
    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()
            
            if viewModel.isLoading && viewModel.nextTwoWeeks.isEmpty {
                ProgressView()
                    .tint(GifterColors.gifterWhite)
            } else {
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            Text("My Occasions")
                                .gifterDisplayL()
                            
                            Text("Keep track of important dates and celebrations")
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                        
                        if let error = viewModel.error {
                            Text(error)
                                .font(.system(size: 14))
                                .foregroundColor(.red)
                                .padding(.horizontal, 24)
                        }
                        
                        // Add Button
                        GifterButton(title: "Add Occasion", style: .primary) {
                            showAddOccasion = true
                        }
                        .padding(.horizontal, 24)
                        
                        // Occasions List
                        if viewModel.nextTwoWeeks.isEmpty && viewModel.later.isEmpty {
                            if !viewModel.isLoading {
                                emptyState
                            }
                        } else {
                            VStack(spacing: 32) {
                                if !viewModel.nextTwoWeeks.isEmpty {
                                    occasionSection(title: "Coming up soon", occasions: viewModel.nextTwoWeeks)
                                }
                                
                                if !viewModel.later.isEmpty {
                                    occasionSection(title: "Later", occasions: viewModel.later)
                                }
                            }
                            .padding(.horizontal, 24)
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
        }
        .sheet(isPresented: $showAddOccasion) {
            NavigationView {
                MakeOccasionView(mode: .create) { newOccasion in
                    viewModel.addOccasion(newOccasion)
                }
            }
        }
        .sheet(item: $selectedOccasion) { occasion in
            NavigationView {
                MakeOccasionView(mode: .edit(occasion)) { updatedOccasion in
                    viewModel.updateOccasion(updatedOccasion)
                }
            }
        }
        .task {
            await viewModel.loadFeed()
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar")
                .font(.system(size: 48))
                .foregroundColor(GifterColors.gifterGray)
            
            Text("No occasions yet")
                .gifterBody()
                .foregroundColor(GifterColors.gifterGray)
            
            Text("Add your first occasion to get started")
                .font(.system(size: 14))
                .foregroundColor(GifterColors.gifterGray.opacity(0.7))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
    
    private func occasionSection(title: String, occasions: [Occasion]) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(GifterColors.gifterWhite)
            
            VStack(spacing: 12) {
                ForEach(occasions) { occasion in
                    OccasionRowView(occasion: occasion)
                        .onTapGesture {
                            selectedOccasion = occasion
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                            Button(role: .destructive) {
                                Task {
                                    await viewModel.deleteOccasion(occasion)
                                }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
        }
    }
}

struct OccasionRowView: View {
    let occasion: Occasion
    
    var body: some View {
        GifterCard {
            HStack(spacing: 16) {
                // Date Circle
                VStack(spacing: 4) {
                    Text(dateDay)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(GifterColors.gifterWhite)
                    
                    Text(dateMonth)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(GifterColors.gifterGray)
                        .textCase(.uppercase)
                }
                .frame(width: 60, height: 60)
                .background(GifterColors.gifterSoftGray)
                .cornerRadius(12)
                
                // Occasion Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(occasion.personName)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(GifterColors.gifterWhite)
                    
                    Text(occasion.occasionType)
                        .font(.system(size: 14))
                        .foregroundColor(GifterColors.gifterGray)
                    
                    Text(occasion.countdownText)
                        .font(.system(size: 12))
                        .foregroundColor(GifterColors.gifterWhite.opacity(0.6))
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)
            }
            .padding(16)
        }
    }
    
    private var dateDay: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: occasion.date)
    }
    
    private var dateMonth: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        return formatter.string(from: occasion.date)
    }
}
