const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    helpful: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    images: [{ type: String }]
}, { timestamps: true });

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });

reviewSchema.statics.getAvgRating = async function(productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    return result[0] || { avg: 0, count: 0 };
};

reviewSchema.post('save', async function() {
    try {
        const stats = await this.constructor.getAvgRating(this.product);
        const Product = mongoose.model('Product');
        await Product.findByIdAndUpdate(this.product, {
            averageRating: parseFloat(stats.avg.toFixed(1)),
            reviewCount: stats.count
        });
    } catch (error) {
        console.error('Update rating error:', error.message);
    }
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);