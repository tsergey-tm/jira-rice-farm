export const numberWithThousands = (x: number | undefined | null) => {
    if (x === null || x === undefined || isNaN(x)) {
        return "NaN"
    }
    return x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};