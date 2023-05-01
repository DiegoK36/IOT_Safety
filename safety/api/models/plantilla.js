import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const templateSchema = new Schema({
    userId: { type: String, required: [true] },
    name: { type: String, required: [true] },
    description: {type: String},
    createdTime: { type: Number, required: [true] },
    widgets: {type: Array, default: []}
});


// Schema to model.
const Plantilla = mongoose.model('Plantilla', templateSchema);

export default Plantilla;