const Address = require('../models/Address')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')
const axios = require('axios');
require('dotenv').config();

const addAddress = async (req, res) => {
    const address = await Address.create(req.body)
    res.status(StatusCodes.CREATED).json({ address })
}

const getAllAddresses = async (req,res) => {
    const addresses = await Address.find({});
    res.status(StatusCodes.OK).json({addresses, count: addresses.length})
}

const deleteAddress = async (req,res) => {
    const {params:{name:addressName}} = req
    const address = await Address.findOneAndDelete({name: addressName})
    if (!address) {
        throw new NotFoundError(`No address with name ${addressName}`)
    }
    res.status(StatusCodes.OK).send()
}

const googleAddresses = async (req,res) => {
  let googleAddressClean = [];
    try {
        const apiUrl = 'https://places.googleapis.com/v1/places:searchText';
    

    
        const headers = {
            'Content-Type': 'application/json',      // Example for setting content type
            'X-Goog-Api-Key': process.env.API_GOOGLE_KEY,       // Example for a custom header
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.googleMapsLinks',       // Example for a custom header
          };
    
        const response = await axios.post(apiUrl, req.body, { headers });
        // if nothing is found
        if (Object.keys(response['data']).length === 0) {
          res.json(googleAddressClean);
        }
        response['data']['places'].forEach(element => {
          googleAddressClean.push({
            'fullAddress': element.formattedAddress,
            'link': element.googleMapsLinks.placeUri
          });
        });
          
        res.json(googleAddressClean);
      } catch (error) {
        console.error('Error posting data to external API:', error.message);
        res.status(500).json({
          error: 'Failed to send data',
          details: error.response ? error.response.data : error.message,
        });
      }
}

module.exports = {
    addAddress,
    getAllAddresses,
    deleteAddress,
    googleAddresses
}