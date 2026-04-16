import torch
import torch.nn as nn
import numpy as np


class TranAD(nn.Module):
    """
    Minimal TranAD implementation (DGL-free)
    Compatible with the original TranAD training pipeline in main.py
    """

    def __init__(self, dims):
        super(TranAD, self).__init__()

        # dims = number of features
        self.name = "TranAD"
        self.n_window = 100
        self.batch = 32
        self.lr = 0.001

        self.encoder = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=dims,
                nhead=1,
                dim_feedforward=128,
                dropout=0.1,
                batch_first=False
            ),
            num_layers=2
        )

        self.decoder = nn.Linear(dims, dims)

    def forward(self, window, elem):
        """
        window: (window_size, batch, features)
        elem:   (1, batch, features)
        """

        # Encode temporal context
        encoded = self.encoder(window)

        # Take last timestep
        last = encoded[-1]

        # Decode
        out = self.decoder(last)

        # Return in expected shape
        return out.view(1, out.shape[0], out.shape[1])
