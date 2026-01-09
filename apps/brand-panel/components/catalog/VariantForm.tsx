import { useState, useEffect } from 'react'
import { ProductVariant } from '@/lib/types/payload'

interface VariantFormProps {
    initialData?: Partial<ProductVariant>
    defaultCurrency: 'GBP' | 'USD' | 'EUR'
    onSave: (data: any) => void
    onCancel: () => void
}

export function VariantForm({ initialData, defaultCurrency, onSave, onCancel }: VariantFormProps) {
    // Parse initial options or start with one empty option row
    const [options, setOptions] = useState<{ option: string; value: string }[]>(
        initialData?.optionValues && initialData.optionValues.length > 0
            ? initialData.optionValues
            : [{ option: '', value: '' }]
    )

    const [formData, setFormData] = useState({
        sku: initialData?.sku || '',
        price: initialData?.price || 0,
        stock: initialData?.stock || 0,
        currency: initialData?.currency || defaultCurrency,
    })

    // Common option presets for autocomplete (could be passed in or fetched)
    const commonOptions = ['Size', 'Color', 'Material', 'Style']

    const handleOptionChange = (index: number, field: 'option' | 'value', val: string) => {
        const newOptions = [...options]
        newOptions[index][field] = val
        setOptions(newOptions)
    }

    const addOption = () => {
        setOptions([...options, { option: '', value: '' }])
    }

    const removeOption = (index: number) => {
        if (options.length === 1) return // Keep at least one
        setOptions(options.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Filter out empty options
        const validOptions = options.filter(o => o.option.trim() && o.value.trim())

        if (validOptions.length === 0) {
            alert('Please add at least one option (e.g. Size: Large)')
            return
        }

        onSave({
            ...formData,
            optionValues: validOptions,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-panelBlack border border-panelSoftGray p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{initialData?.id ? 'Edit Variant' : 'Add Variant'}</h3>
                <button type="button" onClick={onCancel} className="text-panelGray hover:text-panelWhite">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Options Builder */}
            <div className="space-y-3">
                <label className="label block">Variant Options</label>
                {options.map((opt, index) => (
                    <div key={index} className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Option (e.g. Size)"
                                className="input w-full"
                                value={opt.option}
                                onChange={(e) => handleOptionChange(index, 'option', e.target.value)}
                                list={`common-options-${index}`}
                                required
                            />
                            <datalist id={`common-options-${index}`}>
                                {commonOptions.map(o => <option key={o} value={o} />)}
                            </datalist>
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Value (e.g. Medium)"
                                className="input w-full"
                                value={opt.value}
                                onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                required
                            />
                        </div>
                        {options.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-2 text-panelGray hover:text-red-500"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addOption}
                    className="text-xs text-panelGray hover:text-panelWhite flex items-center gap-1"
                >
                    + Add another option
                </button>
            </div>

            {/* Pricing & Stock */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label mb-2 block">Price</label>
                    <div className="flex gap-2">
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                            className="input w-24"
                        >
                            <option value="GBP">GBP</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="input flex-1"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="label mb-2 block">SKU</label>
                    <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="input w-full"
                        placeholder="e.g. SHIRT-BLK-M"
                        required
                    />
                </div>

                <div>
                    <label className="label mb-2 block">Stock Level</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="input w-full"
                        min="0"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-panelSoftGray">
                <button type="button" onClick={onCancel} className="btn-secondary">
                    Cancel
                </button>
                <button type="submit" className="btn-primary">
                    {initialData?.id ? 'Update Variant' : 'Add Variant'}
                </button>
            </div>
        </form>
    )
}
