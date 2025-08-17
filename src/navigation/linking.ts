import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

/**
 * Deep linking configuration for the app
 * Supports URLs like:
 * - campuscrib://hostel/123
 * - campuscrib://search?query=accra
 * - campuscrib://analytics?hostelId=456
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['campuscrib://', 'https://campuscrib.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          SignUp: 'signup',
        },
      },
      Student: {
        screens: {
          Home: {
            screens: {
              HomeMain: 'home',
            },
          },
          Search: {
            screens: {
              SearchMain: {
                path: 'search',
                parse: {
                  query: (query: string) => query || undefined,
                },
              },
            },
          },
          History: {
            screens: {
              HistoryMain: 'history',
            },
          },
          Profile: 'student/profile',
        },
      },
      Landlord: {
        screens: {
          MyHostels: {
            screens: {
              MyHostelsMain: 'my-hostels',
            },
          },
          AddHostel: {
            screens: {
              AddHostelMain: 'add-hostel',
            },
          },
          Analytics: {
            screens: {
              AnalyticsMain: {
                path: 'analytics',
                parse: {
                  hostelId: (hostelId: string) => hostelId || undefined,
                },
              },
            },
          },
          Profile: 'landlord/profile',
        },
      },
    },
  },
};

