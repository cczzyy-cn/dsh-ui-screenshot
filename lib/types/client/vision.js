/** Whether the directory's effective current model accepts image input. */
export function modelSupportsImage(state) {
    const current = state.current;
    if (current === null)
        return false;
    for (const group of state.groups) {
        if (group.id !== current.provider)
            continue;
        for (const model of group.models) {
            if (model.id !== current.model)
                continue;
            return model.inputModalities?.includes('image') === true;
        }
    }
    return false;
}
//# sourceMappingURL=vision.js.map