const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{
        imageUrl: { type: String, required: true },
        color: { type: String, required: true }
    }],
    info: [{
        information: { type: String, required: true },
        color: { type: String, required: true },
        version: { type: String, required: true }
    }],

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },
    slug: { type: String, unique: true, lowercase: true }
}, {
    timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'info.color': 1 });
productSchema.index({ averageRating: -1 }); 

productSchema.pre('save', function() {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema)