import React, { ReactNode, useState, useEffect } from 'react'
import {
  ModalProps,
  FlatListProps,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  ImageStyle,
} from 'react-native'
import { CountryModal } from './CountryModal'
import { HeaderModal } from './HeaderModal'
import { Country, CountryCode, FlagType, Region, Subregion } from './types'
import { CountryFilter, CountryFilterProps } from './CountryFilter'
import { FlagButton } from './FlagButton'
import { useContext } from './CountryContext'
import { CountryList } from './CountryList'

interface State {
  visible: boolean
  countries: Country[]
  filter?: string
  filterFocus?: boolean
}

interface RenderFlagButtonProps extends React.ComponentProps<typeof FlagButton> {
  renderFlagButton?(props: React.ComponentProps<typeof FlagButton>): ReactNode
}

interface RenderCountryFilterProps extends React.ComponentProps<typeof CountryFilter> {
  renderCountryFilter?(props: React.ComponentProps<typeof CountryFilter>): ReactNode
}

const renderFlagButton = (props: RenderFlagButtonProps): ReactNode =>
  props.renderFlagButton ? (
    props.renderFlagButton(props)
  ) : (
    <FlagButton {...props} />
  )

const renderFilter = (props: RenderCountryFilterProps): ReactNode =>
  props.renderCountryFilter ? (
    props.renderCountryFilter(props)
  ) : (
    <CountryFilter {...props} />
  )

interface CountryPickerProps {
  allowFontScaling?: boolean
  countryCode?: CountryCode
  region?: Region
  subregion?: Subregion
  countryCodes?: CountryCode[]
  excludeCountries?: CountryCode[]
  preferredCountries?: CountryCode[]
  modalProps?: ModalProps
  filterProps?: CountryFilterProps
  flatListProps?: FlatListProps<Country>
  withEmoji?: boolean
  withCountryNameButton?: boolean
  withCurrencyButton?: boolean
  withCallingCodeButton?: boolean
  withFlagButton?: boolean
  withCloseButton?: boolean
  withFilter?: boolean
  withAlphaFilter?: boolean
  withCallingCode?: boolean
  withCurrency?: boolean
  withFlag?: boolean
  withModal?: boolean
  disableNativeModal?: boolean
  visible?: boolean
  placeholder?: string
  containerButtonStyle?: StyleProp<ViewStyle>
  closeButtonImage?: ImageSourcePropType
  closeButtonStyle?: StyleProp<ViewStyle>
  closeButtonImageStyle?: StyleProp<ImageStyle>
  renderFlagButton?(props: React.ComponentProps<typeof FlagButton>): ReactNode
  renderCountryFilter?(props: React.ComponentProps<typeof CountryFilter>): ReactNode
  onSelect(country: Country): void
  onOpen?(): void
  onClose?(): void
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
                                                              allowFontScaling = true,
                                                              countryCode,
                                                              region,
                                                              subregion,
                                                              countryCodes,
                                                              renderFlagButton: renderButton,
                                                              renderCountryFilter,
                                                              filterProps,
                                                              modalProps,
                                                              flatListProps,
                                                              onSelect,
                                                              withEmoji = true,
                                                              withFilter,
                                                              withCloseButton,
                                                              withCountryNameButton,
                                                              withCallingCodeButton,
                                                              withCurrencyButton,
                                                              containerButtonStyle,
                                                              withAlphaFilter = false,
                                                              withCallingCode = false,
                                                              withCurrency,
                                                              withFlag,
                                                              withModal = true,
                                                              disableNativeModal,
                                                              withFlagButton,
                                                              onClose: handleClose,
                                                              onOpen: handleOpen,
                                                              closeButtonImage,
                                                              closeButtonStyle,
                                                              closeButtonImageStyle,
                                                              excludeCountries,
                                                              placeholder = 'Select Country',
                                                              preferredCountries,
                                                              visible: initialVisible = false,
                                                            }) => {
  const [state, setState] = useState<State>({
    visible: initialVisible,
    countries: [],
    filter: '',
    filterFocus: false,
  })
  const { translation, getCountriesAsync } = useContext()
  const { visible, filter, countries, filterFocus } = state

  useEffect(() => {
    if (state.visible !== initialVisible) {
      setState((prevState) => ({ ...prevState, visible: initialVisible }))
    }
  }, [initialVisible])

  const onOpen = () => {
    setState((prevState) => ({ ...prevState, visible: true }))
    if (handleOpen) {
      handleOpen()
    }
  }
  const onClose = () => {
    setState((prevState) => ({ ...prevState, filter: '', visible: false }))
    if (handleClose) {
      handleClose()
    }
  }

  const setFilter = (filter: string) => setState((prevState) => ({ ...prevState, filter }))
  const setCountries = (countries: Country[]) => setState((prevState) => ({ ...prevState, countries }))
  const onSelectClose = (country: Country) => {
    onSelect(country)
    onClose()
  }
  const onFocus = () => setState((prevState) => ({ ...prevState, filterFocus: true }))
  const onBlur = () => setState((prevState) => ({ ...prevState, filterFocus: false }))
  const flagProp = {
    allowFontScaling,
    countryCode,
    withEmoji,
    withCountryNameButton,
    withCallingCodeButton,
    withCurrencyButton,
    withFlagButton,
    renderFlagButton: renderButton,
    onOpen,
    containerButtonStyle,
    placeholder,
  }

  useEffect(() => {
    let cancel = false
    getCountriesAsync(
      withEmoji ? FlagType.EMOJI : FlagType.FLAT,
      translation,
      region,
      subregion,
      countryCodes,
      excludeCountries,
      preferredCountries,
      withAlphaFilter,
    )
      .then((countries) => {
        if (!cancel) setCountries(countries)
      })
      .catch(console.warn)

    return () => {
      cancel = true
    }
  }, [translation, withEmoji])

  return (
    <>
      {withModal && renderFlagButton(flagProp)}
      <CountryModal
        {...{ visible, withModal, disableNativeModal, ...modalProps }}
        onRequestClose={onClose}
        onDismiss={onClose}
      >
        <HeaderModal
          {...{
            withFilter,
            onClose,
            closeButtonImage,
            closeButtonImageStyle,
            closeButtonStyle,
            withCloseButton,
          }}
          renderFilter={(props) =>
            renderFilter({
              ...props,
              allowFontScaling,
              renderCountryFilter,
              onChangeText: setFilter,
              value: filter,
              onFocus,
              onBlur,
              ...filterProps,
            })
          }
        />
        <CountryList
          {...{
            onSelect: onSelectClose,
            data: countries,
            letters: [],
            withAlphaFilter: withAlphaFilter && filter === '',
            withCallingCode,
            withCurrency,
            withFlag,
            withEmoji,
            filter,
            filterFocus,
            flatListProps,
          }}
        />
      </CountryModal>
    </>
  )
}
