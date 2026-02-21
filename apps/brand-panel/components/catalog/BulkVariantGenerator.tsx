'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BulkVariantGeneratorProps {
    onGenerate: (variants: any[]) => void
    onCancel: () => void
    defaultPrice: number
    defaultCurrency: string
    productSlug: string
}

export function BulkVariantGenerator({
    onGenerate,
    onCancel,
    defaultPrice,
    defaultCurrency,
    productSlug
}: BulkVariantGeneratorProps) {
    const [optionSets, setOptionSets] = useState<{ name: string; values: string }[]>([
        { name: 'Size', values: 'S, M, L' },
        { name: 'Color', values: 'Black, White' }
    ])

    const addOptionSet = () => {
        setOptionSets([...optionSets, { name: '', values: '' }])
    }

    const removeOptionSet = (index: number) => {
        setOptionSets(optionSets.filter((_, i) => i !== index))
    }

    const updateOptionSet = (index: number, field: 'name' | 'values', value: string) => {
        const newSets = [...optionSets]
        newSets[index][field] = value
        setOptionSets(newSets)
    }

    const handleGenerate = () => {
        // 1. Parse options
        const processedSets = optionSets
            .filter((s) => s.name.trim() && s.values.trim())
            .map((s) => ({
                name: s.name.trim(),
                values: s.values.split(',').map((v) => v.trim()).filter(Boolean)
            }))

        if (processedSets.length === 0) {
            alert('Please add at least one option set (e.g., Size: S, M, L)')
            return
        }

        // 2. Cartesian Product Logic
        const generateCombinations = (sets: any[]): any[][] => {
            const results: any[][] = [[]];
            for (const set of sets) {
                const temp: any[][] = [];
                for (const res of results) {
                    for (const val of set.values) {
                        temp.push([...res, { option: set.name, value: val }]);
                    }
                }
                results.splice(0, results.length, ...temp);
            }
            return results;
        }

        const combinations = generateCombinations(processedSets)

        // 3. Create Variant objects
        const generatedVariants = combinations.map((combo) => {
            const comboShort = combo.map(c => c.value.substring(0, 3).toUpperCase()).join('-')
            return {
                id: `temp-${Math.random().toString(36).substr(2, 9)}`,
                optionValues: combo,
                price: defaultPrice,
                currency: defaultCurrency,
                sku: `${productSlug.toUpperCase()}-${comboShort}`,
                stock: 0
            }
        })

        onGenerate(generatedVariants)
    }

    return (
        <div className="rounded-lg border border-panelSoftGray bg-panelBlack p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Bulk Variant Generator</h3>
                    <p className="mt-1 text-sm text-panelGray">
                        Define your options (e.g., Size, Color) and we'll generate all combinations.
                    </p>
                </div>
                <button onClick={onCancel} className="text-panelGray hover:text-panelWhite">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {optionSets.map((set, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-4 items-start"
                        >
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-medium text-panelGray uppercase tracking-wider">Option Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Size"
                                    className="input w-full"
                                    value={set.name}
                                    onChange={(e) => updateOptionSet(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="flex-[2] space-y-2">
                                <label className="text-xs font-medium text-panelGray uppercase tracking-wider">Values (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. S, M, L"
                                    className="input w-full"
                                    value={set.values}
                                    onChange={(e) => updateOptionSet(index, 'values', e.target.value)}
                                />
                            </div>
                            {optionSets.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeOptionSet(index)}
                                    className="mt-8 p-2 text-panelGray hover:text-red-500"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button
                    type="button"
                    onClick={addOptionSet}
                    className="flex items-center gap-2 text-xs font-medium text-panelGray hover:text-panelWhite"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add another option set
                </button>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-panelSoftGray pt-6">
                <button onClick={onCancel} className="btn-secondary">
                    Cancel
                </button>
                <button onClick={handleGenerate} className="btn-primary">
                    Generate {optionSets.reduce((acc, set) => acc * (set.values.split(',').filter(v => v.trim()).length || 1), 1)} Variants
                </button>
            </div>
        </div>
    )
}
