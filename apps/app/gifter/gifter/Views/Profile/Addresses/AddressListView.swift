//
//  AddressListView.swift
//  gifter
//
//  Address Management View
//

import SwiftUI

struct AddressListView: View {
    @EnvironmentObject var appState: AppState
    @State private var addresses: [Address] = []
    @State private var isLoading = true
    @State private var showAddAddress = false
    @State private var selectedAddress: Address?
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()
            
            if isLoading {
                ProgressView()
                    .tint(GifterColors.gifterWhite)
            } else {
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            Text("My Addresses")
                                .gifterDisplayL()
                            
                            Text("Manage your shipping and billing addresses")
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                        
                        if let errorMessage = errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 14))
                                .foregroundColor(.red)
                                .padding(.horizontal, 24)
                        }
                        
                        // Add Button
                        GifterButton(title: "Add Address", style: .primary) {
                            showAddAddress = true
                        }
                        .padding(.horizontal, 24)
                        
                        // Addresses List
                        if addresses.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "mappin.and.ellipse")
                                    .font(.system(size: 48))
                                    .foregroundColor(GifterColors.gifterGray)
                                
                                Text("No addresses yet")
                                    .gifterBody()
                                    .foregroundColor(GifterColors.gifterGray)
                                
                                Text("Add your first address to get started")
                                    .font(.system(size: 14))
                                    .foregroundColor(GifterColors.gifterGray.opacity(0.7))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 60)
                        } else {
                            VStack(spacing: 12) {
                                ForEach(addresses) { address in
                                    AddressRowView(address: address)
                                        .onTapGesture {
                                            selectedAddress = address
                                        }
                                        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                            Button(role: .destructive) {
                                                Task {
                                                    await deleteAddress(address)
                                                }
                                            } label: {
                                                Label("Delete", systemImage: "trash")
                                            }
                                        }
                                }
                            }
                            .padding(.horizontal, 24)
                        }
                        
                        Spacer(minLength: 100)
                    }
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
        .sheet(isPresented: $showAddAddress) {
            NavigationView {
                AddAddressView(mode: .create) { newAddress in
                    addresses.append(newAddress)
                }
            }
        }
        .sheet(item: $selectedAddress) { address in
            NavigationView {
                AddAddressView(mode: .edit(address)) { updatedAddress in
                    if let index = addresses.firstIndex(where: { $0.id == updatedAddress.id }) {
                        addresses[index] = updatedAddress
                    }
                }
            }
        }
        .task {
            await loadAddresses()
        }
    }
    
    private func loadAddresses() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let loadedAddresses = try await AddressService.shared.getAddresses()
            await MainActor.run {
                addresses = loadedAddresses
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to load addresses"
                isLoading = false
            }
        }
    }
    
    private func deleteAddress(_ address: Address) async {
        do {
            try await AddressService.shared.deleteAddress(id: address.id)
            await MainActor.run {
                addresses.removeAll { $0.id == address.id }
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to delete address"
            }
        }
    }
}

struct AddressRowView: View {
    let address: Address
    
    var body: some View {
        GifterCard {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: address.isDefault ? "house.fill" : "mappin.circle.fill")
                    .font(.system(size: 24))
                    .foregroundColor(address.isDefault ? GifterColors.gifterWhite : GifterColors.gifterGray)
                    .frame(width: 40)
                
                // Address Info
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(address.displayLabel)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(GifterColors.gifterWhite)
                        
                        if address.isDefault {
                            Text("DEFAULT")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(GifterColors.gifterBlack)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(GifterColors.gifterWhite)
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(address.line1)
                        .font(.system(size: 14))
                        .foregroundColor(GifterColors.gifterGray)
                    
                    Text("\(address.city), \(address.state ?? "") \(address.postalCode)")
                        .font(.system(size: 14))
                        .foregroundColor(GifterColors.gifterGray)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)
            }
            .padding(16)
        }
    }
}
