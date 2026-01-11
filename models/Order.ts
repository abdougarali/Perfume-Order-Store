import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    customerAddress: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },

    // Perfume Products Ordered
    products: [
      {
        id: String,
        name: String,
        category: String,
        volume: String, // Changed from size/color to volume for perfumes
        fragranceNotes: String, // Added fragrance notes
        price: Number,
        image: String,
        quantity: Number, // Added quantity field
      },
    ],

    // Order Information
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'delivered', 'canceled'],
      default: 'new',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Delete model from memory if it exists to allow redefinition with updates
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model('Order', OrderSchema);
