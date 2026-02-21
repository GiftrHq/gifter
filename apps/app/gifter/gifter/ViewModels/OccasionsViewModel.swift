//
//  OccasionsViewModel.swift
//  gifter
//
//  Occasions View State Management
//

import Foundation
import SwiftUI
import Combine

@MainActor
final class OccasionsViewModel: ObservableObject {
    // MARK: - Published State

    @Published var nextTwoWeeks: [Occasion] = []
    @Published var later: [Occasion] = []
    @Published var isLoading = false
    @Published var error: String?

    // MARK: - Private Properties

    private let occasionService = OccasionService.shared

    // MARK: - Lifecycle

    init() {}

    // MARK: - Public Methods

    func loadFeed() async {
        guard !isLoading else { return }

        isLoading = true
        error = nil

        do {
            let feed = try await occasionService.getOccasionFeed(days: 90) // Show more in the list
            
            withAnimation {
                self.nextTwoWeeks = feed.nextTwoWeeks
                self.later = feed.later
                self.isLoading = false
            }
        } catch {
            self.error = "Failed to load occasions"
            self.isLoading = false
        }
    }

    func deleteOccasion(_ occasion: Occasion) async {
        do {
            try await occasionService.deleteOccasion(id: occasion.id)
            
            withAnimation {
                nextTwoWeeks.removeAll { $0.id == occasion.id }
                later.removeAll { $0.id == occasion.id }
            }
        } catch {
            self.error = "Failed to delete occasion"
        }
    }
    
    func addOccasion(_ occasion: Occasion) {
        // Simple logic to add to local state without full reload
        // In a real app, we might want to re-sort or re-fetch
        withAnimation {
            // Re-fetch is safer for correct grouping
            Task { await loadFeed() }
        }
    }
    
    func updateOccasion(_ occasion: Occasion) {
        withAnimation {
            Task { await loadFeed() }
        }
    }
}
