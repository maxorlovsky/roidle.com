// Configs
import allMaps from '../../config/map.json';

export default {
    getLocation(locationId) {
        let mapPiece = null;

        for (const row of Object.keys(allMaps)) {
            mapPiece = allMaps[row].find((piece) => piece.id === Number(locationId));

            if (mapPiece) {
                break;
            }
        }

        return mapPiece;
    }
};