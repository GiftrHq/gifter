//
//  MakeOccasionView.swift
//  gifter
//
//  Create/Edit Occasion View
//

import SwiftUI

enum OccasionMode {
    case create
    case edit(Occasion)
}

struct MakeOccasionView: View {
    @Environment(\.dismiss) var dismiss
    
    let mode: OccasionMode
    let onSave: (Occasion) -> Void
    
    @State private var recipientId: String = ""
    @State private var occasionType: String = "BIRTHDAY"
    @State private var title: String = ""
    @State private var date: Date = Date()
    @State private var recurrence: OccasionRecurrence = .none
    @State private var visibility: OccasionVisibility = .publicVisibility
    @State private var sharedWithUserIds: [String] = []
    
    @State private var showUserPicker = false
    @State private var notes: String = ""
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    private let occasionTypes = [
        "BIRTHDAY",
        "ANNIVERSARY",
        "WEDDING",
        "BABY_SHOWER",
        "HOUSEWARMING",
        "THANK_YOU",
        "JUST_BECAUSE",
        "OTHER"
    ]
    
    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(isEditMode ? "Edit Occasion" : "New Occasion")
                            .gifterDisplayL()
                        
                        Text("Keep track of important celebrations")
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
                                    Text("Title (Optional)")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextField("e.g., Mom's Birthday", text: $title)
                                        .textFieldStyle(GifterTextFieldStyle())
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Occasion Type")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    Picker("Type", selection: $occasionType) {
                                        ForEach(occasionTypes, id: \.self) { type in
                                            Text(type.replacingOccurrences(of: "_", with: " ").capitalized)
                                                .tag(type)
                                        }
                                    }
                                    .pickerStyle(.menu)
                                    .tint(GifterColors.gifterWhite)
                                    .padding(16)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(GifterColors.gifterSoftGray.opacity(0.3))
                                    .cornerRadius(12)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Date")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    DatePicker("", selection: $date, displayedComponents: .date)
                                        .datePickerStyle(.compact)
                                        .labelsHidden()
                                        .tint(GifterColors.gifterWhite)
                                        .padding(16)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(GifterColors.gifterSoftGray.opacity(0.3))
                                        .cornerRadius(12)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Recurrence")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    Picker("Recurrence", selection: $recurrence) {
                                        Text("None").tag(OccasionRecurrence.none)
                                        Text("Yearly").tag(OccasionRecurrence.yearly)
                                    }
                                    .pickerStyle(.segmented)
                                    .tint(GifterColors.gifterWhite)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Visibility")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    Picker("Who can see this?", selection: $visibility) {
                                        Text("Public (All Friends)").tag(OccasionVisibility.publicVisibility)
                                        Text("Private (Selected People)").tag(OccasionVisibility.privateVisibility)
                                    }
                                    .pickerStyle(.menu)
                                    .tint(GifterColors.gifterWhite)
                                    .padding(16)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(GifterColors.gifterSoftGray.opacity(0.3))
                                    .cornerRadius(12)
                                    
                                    if visibility == .privateVisibility {
                                        Button {
                                            showUserPicker = true
                                        } label: {
                                            HStack {
                                                Image(systemName: "person.badge.plus")
                                                Text(sharedWithUserIds.isEmpty ? "Select people..." : "\(sharedWithUserIds.count) people selected")
                                                Spacer()
                                                Image(systemName: "chevron.right")
                                                    .font(.system(size: 14, weight: .semibold))
                                            }
                                            .foregroundColor(GifterColors.gifterWhite)
                                            .padding(16)
                                            .background(GifterColors.gifterSoftGray.opacity(0.3))
                                            .cornerRadius(12)
                                        }
                                    }
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Notes (Optional)")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(GifterColors.gifterGray)
                                        .textCase(.uppercase)
                                    
                                    TextEditor(text: $notes)
                                        .frame(height: 100)
                                        .padding(12)
                                        .background(GifterColors.gifterSoftGray.opacity(0.3))
                                        .cornerRadius(12)
                                        .foregroundColor(GifterColors.gifterWhite)
                                        .font(.system(size: 16))
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
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
                            title: isLoading ? "Saving..." : "Save Occasion",
                            style: .primary,
                        ) {
                            Task {
                                await saveOccasion()
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
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancel") {
                    dismiss()
                }
                .foregroundColor(GifterColors.gifterWhite)
            }
        }
        .onAppear {
            loadOccasionData()
        }
    }
    
    private var isEditMode: Bool {
        if case .edit = mode {
            return true
        }
        return false
    }
    
    private func loadOccasionData() {
        if case .edit(let occasion) = mode {
            title = occasion.personName
            occasionType = occasion.occasionType
            date = occasion.date
            // Note: recurrence and notes not in current Occasion model
        }
    }
    
    private func saveOccasion() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let savedOccasion: Occasion
            
            if case .edit(let existingOccasion) = mode {
                // Update existing occasion
                savedOccasion = try await OccasionService.shared.updateOccasion(
                    id: existingOccasion.id,
                    title: title.isEmpty ? nil : title,
                    date: date,
                    notes: notes.isEmpty ? nil : notes,
                    recurrence: recurrence,
                    visibility: visibility,
                    sharedWithUserIds: sharedWithUserIds
                )
            } else {
                // Create personal occasion
                savedOccasion = try await OccasionService.shared.createOccasion(
                    recipientId: nil,
                    type: occasionType,
                    title: title.isEmpty ? nil : title,
                    date: date,
                    recurrence: recurrence,
                    visibility: visibility,
                    sharedWithUserIds: sharedWithUserIds,
                    notes: notes.isEmpty ? nil : notes
                )
            }
            
            await MainActor.run {
                onSave(savedOccasion)
                isLoading = false
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to save occasion. Please try again."
                isLoading = false
            }
        }
    }
}
