import React, { useState, useEffect, useRef } from 'react'
import { get, set } from './domain'

type Validator<T> = (value: T) => Array<string> | any;
type Update<TTarget> = (updatedModel: TTarget) => void;
type Blur = () => void;
type Error = {
    location: string;
    message: string;
};

type ValidationModel = {
    set: React.Dispatch<any>,
    get: (location: string) => Array<string>,
    getAllErrorsForLocation: (location: string) => Array<Error>
};

function filteredObjectToArray<T>(
    obj: any,
    keyFilter: (key: string) => boolean,
    mapper: (key: string, value: any) => T): Array<T> {
    return Object
        .keys(obj)
        .filter(keyFilter)
        .map(key => mapper(key, obj[key]));
}

export function useValidationModelFor(model: any): ValidationModel {
    const [validationModel, setValidationModel] = useState<any>({});

    return {
        set: setValidationModel,
        get: (location: string) => validationModel[location] || [],
        getAllErrorsForLocation: location => filteredObjectToArray(validationModel,
            key => key.startsWith(location),
            (key, value) => ({ location: key, message: value }))
            .filter(error => error?.message?.length)
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