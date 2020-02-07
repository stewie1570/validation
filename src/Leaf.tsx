import React, { useState, useEffect, useRef } from 'react'
import { get, set } from './domain'

type Validator<T> = (value: T) => Array<string> | any;
type Update<TTarget> = (updatedModel: TTarget) => void;
type Blur = () => void;
type ValidationModel = {
    set: React.Dispatch<any>,
    get: (target: string) => Array<string>
};

export function useValidationModelFor(model: any): ValidationModel {
    const [validationModel, setValidationModel] = useState<any>({});

    return {
        set: setValidationModel,
        get: (target: string) => validationModel[target] || []
    }
}

export function Leaf<Model, Target>(props: {
    children: (model: Target, onChange: Update<Target>, onBlur: Blur, errors: Array<string>) => any,
    location: string,
    model: Model,
    onChange: React.Dispatch<React.SetStateAction<Model>>,
    validationModel?: ValidationModel,
    validators?: Array<Validator<Target>>,
    showErrors?: boolean
}) {
    const [hasBlurred, setHasBlurred] = useState(false);
    const { children, location, model, validationModel, validators, onChange, showErrors } = props;
    const instance = useRef({ validationModel, validators })
    const targetValue = get<Target>(location).from(model);

    useEffect(() => {
        const { validationModel, validators } = instance.current
        if (validationModel && validators && validators.length) {
            validationModel.set((origValidationModel: any) => ({
                ...origValidationModel,
                [location]: validators
                    .map(validator => validator(targetValue))
                    .filter(value => value)
                    .flat()
            }));
        }
    }, [targetValue, location]);

    return children(
        targetValue,
        update => onChange(set(location).to(update).in(model)),
        () => setHasBlurred(true),
        validationModel && (hasBlurred || showErrors) ? validationModel.get(location) : []
    );
}