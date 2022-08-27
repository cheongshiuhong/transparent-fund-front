// Types
import { StylesConfig } from 'react-select';

// type SelectStyle = Styles<SelectType, true>;

/** The style object for react-select https://react-select.com/styles */
const styles: StylesConfig = {
    control: (styles) => ({
        ...styles,
        fontSize: '11pt',
        background: 'white',
        height: '2rem',
        overflowY: 'auto',
        width: '100%',
        minWidth: '10rem',
        borderWidth: '1px',
        borderRadius: '0.5rem',
        paddingLeft: '0.25rem',
        borderColor: 'rgba(215, 219, 224, 0.8)'
    }),
    option: (styles, { isDisabled, isFocused, isSelected }) => ({
        ...styles,
        color: isDisabled ? '#808080' : isSelected ? '#7941EF' : isFocused ? '#7941EF' : '',
        backgroundColor: isDisabled
            ? ''
            : isSelected
            ? 'rgba(121, 65, 239, 0.08)'
            : isFocused
            ? 'rgba(121, 65, 239, 0.08)'
            : '',
        cursor: isDisabled ? 'not-allowed' : 'default',
        fontSize: '75%'
    }),
    multiValue: (styles) => ({
        ...styles,
        borderRadius: '25px',
        background: 'rgba(121, 65, 239, 0.08)',
        width: '100%',
        color: '#7941EF'
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: '#7941EF'
    }),
    clearIndicator: (styles) => ({
        ...styles,
        alignSelf: 'flex-start'
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        alignSelf: 'flex-start'
    })
};

export default styles;
