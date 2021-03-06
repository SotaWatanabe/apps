// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TypeDef } from '@polkadot/types/types';
import { ParamDef, Props, RawParam } from '../types';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@polkadot/react-components';
import { isUndefined } from '@polkadot/util';

import { useTranslation } from '../translate';
import getInitValue from '../initValue';
import Params from '../';
import Base from './Base';

function generateParam (type: TypeDef, index: number): ParamDef {
  return {
    name: `${index}: ${type.type}`,
    type
  };
}

function Vector ({ className = '', defaultValue, isDisabled = false, label, onChange, overrides, type, withLabel }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [params, setParams] = useState<ParamDef[]>([]);
  const [values, setValues] = useState<RawParam[]>([]);

  // when !isDisable, generating an input & params based on count
  useEffect((): void => {
    if (!isDisabled) {
      const subType = type.sub as TypeDef;
      const params: ParamDef[] = [];

      for (let index = 0; index < count; index++) {
        params.push(generateParam(subType, index));
      }

      setParams(params);

      if (values.length !== count) {
        while (values.length < count) {
          const value = getInitValue(type.sub as TypeDef);

          values.push({ isValid: !isUndefined(value), value });
        }

        setValues(values.slice(0, count));
      }
    }
  }, [count, isDisabled, type, values]);

  // when isDisabled, set the params & values based on the defaultValue input
  useEffect((): void => {
    if (isDisabled) {
      const subType = type.sub as TypeDef;
      const params: ParamDef[] = [];
      const values: RawParam[] = [];

      (defaultValue.value as RawParam[] || []).forEach((value: RawParam, index: number): void => {
        values.push(
          isUndefined(value) || isUndefined(value.isValid)
            ? { isValid: !isUndefined(value), value }
            : value
        );
        params.push(generateParam(subType, index));
      });

      setParams(params);
      setValues(values);
    }
  }, [defaultValue, isDisabled, type]);

  // when our values has changed, alert upstream
  useEffect((): void => {
    onChange && onChange({
      isValid: values.reduce((result: boolean, { isValid }): boolean => result && isValid, true),
      value: values.map(({ value }): any => value)
    });
  }, [values, onChange]);

  const _rowAdd = useCallback(
    (): void => setCount((count) => count + 1),
    []
  );
  const _rowRemove = useCallback(
    (): void => setCount((count) => count - 1),
    []
  );

  return (
    <Base
      className={className}
      isOuter
      label={label}
      withLabel={withLabel}
    >
      {!isDisabled && (
        <div className='ui--Param-Vector-buttons'>
          <Button
            icon='add'
            isPrimary
            label={t<string>('Add item')}
            onClick={_rowAdd}
          />
          <Button
            icon='minus'
            isDisabled={values.length === 0}
            isNegative
            label={t<string>('Remove item')}
            onClick={_rowRemove}
          />
        </div>
      )}
      <Params
        isDisabled={isDisabled}
        onChange={setValues}
        overrides={overrides}
        params={params}
        values={values}
      />
    </Base>
  );
}

export default React.memo(Vector);
