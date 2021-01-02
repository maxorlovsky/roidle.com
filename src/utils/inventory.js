const sort = (inventory, sort) => {
    if (sort !== 'all' && sort !== 'etc') {
        const sortTypes = [];

        if (sort === 'consumables') {
            sortTypes.push('healing');
            sortTypes.push('consumables');
        } else if (sort === 'equipment') {
            sortTypes.push('weapon');
            sortTypes.push('armor');
        }

        inventory = inventory.filter((item) => sortTypes.includes(item.type));
    } else if (sort === 'etc') {
        inventory = inventory.filter((item) => !['healing', 'consumables', 'weapon', 'armor'].includes(item.type));
    }

    return inventory;
};

export { sort };