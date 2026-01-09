//
//  HomeViewModel.swift
//  gifter
//
//  Home View State Management
//

import Foundation
import SwiftUI
import Combine

@MainActor
final class HomeViewModel: ObservableObject {
    // MARK: - Published State

    @Published var collections: [GiftCollection] = []
    @Published var upcomingOccasions: [Occasion] = []
    @Published var recommendedForYou: [Product] = []

    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var error: HomeError?
    @Published var hasLoadedInitialData = false

    // MARK: - Private Properties

    private let collectionService = CollectionService.shared
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Errors

    enum HomeError: LocalizedError {
        case loadFailed(String)
        case networkUnavailable

        var errorDescription: String? {
            switch self {
            case .loadFailed(let message):
                return message
            case .networkUnavailable:
                return "No internet connection"
            }
        }

        var recoveryMessage: String {
            switch self {
            case .loadFailed:
                return "Pull to refresh to try again"
            case .networkUnavailable:
                return "Check your connection and try again"
            }
        }
    }

    // MARK: - Lifecycle

    init() {
    }

    // MARK: - Public Methods

    func loadData() async {
        guard !isLoading else { return }

        isLoading = true
        error = nil
        defer { isLoading = false } // ✅ always resets

        #if DEBUG
        print("HomeViewModel: Loading home data...")
        #endif

        do {
            // Fetch collections from API
            let fetchedCollections = try await collectionService.getCollections(limit: 10)
            
            // If we were cancelled mid-flight, don’t update state.
            guard !Task.isCancelled else { return }

            #if DEBUG
            print("HomeViewModel: Loaded \(fetchedCollections.count) collections")
            #endif

            // Animate the update
            withAnimation(.easeOut(duration: 0.3)) {
                self.collections = fetchedCollections
                self.hasLoadedInitialData = true
            }

        } catch is CancellationError {
            // ✅ Expected with .refreshable / view lifecycle; ignore silently
            return
        } catch {
            #if DEBUG
            print("HomeViewModel: Failed to load data - \(error)")
            #endif

            // Only show error if we don't have cached data
            if collections.isEmpty {
                self.error = .loadFailed(error.localizedDescription)
            }
        }

        isLoading = false
    }

    func refresh() async {
            guard !isRefreshing else { return }

            isRefreshing = true
            defer { isRefreshing = false } // ✅ always resets

            #if DEBUG
            print("HomeViewModel: Refreshing...")
            #endif

            do {
                // If this gets cancelled, it will throw CancellationError.
                try await Task.sleep(nanoseconds: 300_000_000)
                try Task.checkCancellation()

                await loadData()
            } catch is CancellationError {
                // ✅ Expected; ignore
                return
            } catch {
                // You can optionally log unexpected refresh errors here.
                return
            }
        }


    func clearError() {
        withAnimation {
            error = nil
        }
    }
}
