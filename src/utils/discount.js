export default (price, skillLevel) => {
    // Discount
    if (skillLevel > 0) {
        price -= Math.floor(price * ((5 + skillLevel) / 100));
    }

    return price || 1;
};