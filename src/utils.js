export const ABORTED = Symbol('ABORTED');

export const delayPromise = async (delay, abortSignal) =>
    new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);

        const abort = () => {
            clearTimeout(timeoutId);
            reject(ABORTED);
        };

        if (abortSignal) {
            if (abortSignal.aborted) {
                return abort();
            }

            abortSignal.addEventListener('abort', abort);
        }
    });
